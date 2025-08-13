require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');

const { db } = require('./db');
const { protect } = require('./auth');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: 'http://localhost:5173', // Allow frontend dev server
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// --- AUTH ROUTES ---

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
app.post('/api/auth/register', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Please provide email and password' });
    }
    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    await db.read();
    const userExists = db.data.users.find(u => u.email === email);

    if (userExists) {
        return res.status(400).json({ error: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
        id: uuidv4(),
        email,
        password: hashedPassword
    };

    db.data.users.push(newUser);
    await db.write();

    const { password: _, ...userWithoutPassword } = newUser;
    generateTokenAndSetCookie(res, newUser.id);

    res.status(201).json(userWithoutPassword);
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    
    await db.read();
    const user = db.data.users.find(u => u.email === email);

    if (user && (await bcrypt.compare(password, user.password))) {
        const { password: _, ...userWithoutPassword } = user;
        generateTokenAndSetCookie(res, user.id);
        res.json(userWithoutPassword);
    } else {
        res.status(401).json({ error: 'Invalid email or password' });
    }
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
app.post('/api/auth/logout', (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({ message: 'Logged out successfully' });
});

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
app.get('/api/auth/me', protect, (req, res) => {
    res.json(req.user);
});

const generateTokenAndSetCookie = (res, userId) => {
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });

    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development', // Use secure cookies in production
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
};


// --- PANTRY ROUTES ---

// @desc    Get all pantry items for a user
// @route   GET /api/pantry
// @access  Private
app.get('/api/pantry', protect, async (req, res) => {
    await db.read();
    const items = db.data.pantryItems.filter(item => item.userId === req.user.id);
    res.json(items);
});

// @desc    Add a new pantry item
// @route   POST /api/pantry
// @access  Private
app.post('/api/pantry', protect, async (req, res) => {
    const { name, quantity, unit, category, expirationDate } = req.body;

    if (!name || !quantity || !category) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const newItem = {
        id: uuidv4(),
        userId: req.user.id,
        name,
        quantity,
        unit,
        category,
        expirationDate,
        createdAt: new Date().toISOString(),
    };

    db.data.pantryItems.push(newItem);
    await db.write();

    res.status(201).json(newItem);
});

// @desc    Update a pantry item
// @route   PUT /api/pantry/:id
// @access  Private
app.put('/api/pantry/:id', protect, async (req, res) => {
    await db.read();
    const itemIndex = db.data.pantryItems.findIndex(item => item.id === req.params.id);

    if (itemIndex === -1 || db.data.pantryItems[itemIndex].userId !== req.user.id) {
        return res.status(404).json({ error: 'Item not found or not authorized' });
    }
    
    const updatedItem = { ...db.data.pantryItems[itemIndex], ...req.body };
    db.data.pantryItems[itemIndex] = updatedItem;
    await db.write();

    res.json(updatedItem);
});

// @desc    Delete a pantry item
// @route   DELETE /api/pantry/:id
// @access  Private
app.delete('/api/pantry/:id', protect, async (req, res) => {
    await db.read();
    const initialLength = db.data.pantryItems.length;
    db.data.pantryItems = db.data.pantryItems.filter(item => !(item.id === req.params.id && item.userId === req.user.id));
    
    if (db.data.pantryItems.length === initialLength) {
         return res.status(404).json({ error: 'Item not found or not authorized' });
    }
    
    await db.write();
    res.status(200).json({ message: 'Item deleted' });
});

// --- NOTIFICATION ROUTE ---

// @desc    Get notifications for expiring items
// @route   GET /api/notifications
// @access  Private
app.get('/api/notifications', protect, async (req, res) => {
    await db.read();
    const items = db.data.pantryItems.filter(item => item.userId === req.user.id && item.expirationDate);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const notifications = items.map(item => {
        const expiration = new Date(item.expirationDate);
        const diffTime = expiration.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
            return { id: item.id, title: `${item.name} has expired!`, message: `Expired on ${expiration.toLocaleDateString()}`, status: 'EXPIRED'};
        }
        if (diffDays <= 3) {
            return { id: item.id, title: `${item.name} is expiring soon!`, message: `Expires in ${diffDays + 1} day(s)`, status: 'SOON'};
        }
        return null;
    }).filter(Boolean);

    res.json(notifications);
});


// --- RECIPE GENERATION ROUTE ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const recipeSchema = {
  type: "ARRAY",
  items: {
    type: "OBJECT",
    properties: {
      recipeName: {
        type: "STRING",
        description: 'The name of the recipe.',
      },
      description: {
        type: "STRING",
        description: 'A brief, enticing description of the dish.'
      },
      ingredients: {
        type: "ARRAY",
        items: {
          type: "STRING",
        },
        description: 'The ingredients required for the recipe, taken from the provided list.',
      },
      instructions: {
        type: "ARRAY",
        items: {
          type: "STRING",
        },
        description: 'The step-by-step instructions for preparing the recipe.'
      }
    },
    required: ["recipeName", "description", "ingredients", "instructions"],
  },
};

// @desc    Generate recipes from user's pantry
// @route   POST /api/recipes/generate
// @access  Private
app.post('/api/recipes/generate', protect, async (req, res) => {
    await db.read();
    const items = db.data.pantryItems.filter(item => item.userId === req.user.id);

    if (items.length === 0) {
        return res.status(400).json({ error: 'Your pantry is empty. Add items to generate recipes.'});
    }

    const ingredientList = items.map(item => `${item.name} (${item.quantity} ${item.unit || ''})`.trim());

    const prompt = `Based on the following ingredients, suggest a few creative and practical recipes.
  
    Available Ingredients: ${ingredientList.join(', ')}
    
    Please provide recipes that primarily use these ingredients. You can assume common pantry staples like salt, pepper, oil, and water are available.
    The response must be a JSON array conforming to the provided schema.`;

    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: { responseMimeType: "application/json", responseSchema: recipeSchema },
            safetySettings: [ // More strict safety settings
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
            ]
        });

        const result = await model.generateContent(prompt);
        const response = result.response;
        const recipes = JSON.parse(response.text());
        res.json(recipes);

    } catch (error) {
        console.error("Error generating recipes:", error);
        res.status(500).json({ error: "Failed to generate recipes. The AI might be busy, please try again later." });
    }
});


// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
    const buildPath = path.resolve(__dirname, '../dist');
    app.use(express.static(buildPath));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(buildPath, 'index.html'));
    });
}


app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});