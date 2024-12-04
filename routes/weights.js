const express = require('express');
const router = express.Router();
const Weight = require('../models/weightModel');
const isAuthenticated = require('../middleware/authMiddleware');

// GET: Render form to create a weight entry
router.get('/create_weight',isAuthenticated,  (req, res) => {
    res.render('./weight/create_weight',{ title: 'Create Weight', error: null });
});

// POST: Create a weight entry
router.post('/create_weight', isAuthenticated, async (req, res) => {
    try {
        const { weight } = req.body;
        const userId = req.session.userId; // Get the logged-in user's ID
        // Check if an entry already exists for the current day
        const startOfDay = new Date().setHours(0, 0, 0, 0);
        const endOfDay = new Date().setHours(23, 59, 59, 999);

        const existingEntry = await Weight.findOne({
            userId,
            date: { $gte: startOfDay, $lte: endOfDay },
        });

        if (existingEntry) {
            return res.render('./weight/create_weight', {title: 'Create Weight',
                error: { message: 'Weight entry for today already exists.' },
            });
        }

        // Save new weight entry
        const newWeight = new Weight({ weight, userId });
        await newWeight.save();
        res.redirect('/weights/retrieve_weight');
    } catch (error) {
        console.error('Error saving weight:', error);
        res.render('./weight/create_weight', {title: 'Create Weight', error: { message: 'Failed to save weight' } });
    }
});

// GET: Retrieve all weight entries
router.get('/retrieve_weight', isAuthenticated, async (req, res) => {
    const { page = 1, limit = 3 } = req.query;
    const userId = req.session.userId; // Get the logged-in user's ID
    try {
        const options = {
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            lean: true,
        };

        const result = await Weight.paginate({userId}, options);
        res.render('./weight/retrieve_weight', {title: 'Weight List',
            data: result.docs,
            pagination: result,
        });
    } catch (error) {
        console.error('Error fetching paginated weights:', error);
        res.render('./weight/retrieve_weight', { title: 'Weight List', data: [], pagination: {} });
    }
});

// GET: Render form to update a weight entry
router.get('/update_weight/:id', isAuthenticated, async (req, res) => {
    try {
        const weight = await Weight.findOne({ _id: req.params.id, userId: req.session.userId }).lean(); // Ensure the weight belongs to the logged-in user
        if (weight) {
            weight.date = new Date(weight.date).toISOString().split('T')[0];
            res.render('./weight/update_weight', { title: 'Update Weight', weights: weight, error: null });
        } else {
            res.redirect('/weights/retrieve_weight');
        }
    } catch (error) {
        console.error('Error fetching weight for update:', error);
        res.redirect('/weights/retrieve_weight');
    }
});

// POST: Update a weight entry
router.post('/update_weight/:id', isAuthenticated, async (req, res) => {
    try {
        const { weight, date } = req.body;
        await Weight.findByIdAndUpdate(req.params.id, { weight, date });
        res.redirect('/weights/retrieve_weight');
    } catch (error) {
        console.error('Error updating weight:', error);
        res.redirect('/weights/retrieve_weight');
    }
});

// GET: Confirm delete a weight entry
router.get('/delete_weight/:id', isAuthenticated, async (req, res) => {
    try {
        // Find the weight by ID and ensure it belongs to the logged-in user
        const weight = await Weight.findOne({ _id: req.params.id, userId: req.session.userId }).lean();
        if (weight) {
            res.render('./weight/delete_weight', { title: 'Delete Weight', weights: weight, error: null });
        } else {
            res.redirect('/weights/retrieve_weight'); // Redirect if the weight doesn't belong to the user
        }
    } catch (error) {
        console.error('Error fetching weight for deletion:', error);
        res.redirect('/weights/retrieve_weight');
    }
});

// POST: Delete a weight entry
router.post('/delete_weight/:id', isAuthenticated, async (req, res) => {
    try {
        // Delete the weight only if it belongs to the logged-in user
        const result = await Weight.findOneAndDelete({ _id: req.params.id, userId: req.session.userId });
        if (result) {
            res.redirect('/weights/retrieve_weight'); // Successfully deleted
        } else {
            res.redirect('/weights/retrieve_weight'); // Redirect if no weight was deleted
        }
    } catch (error) {
        console.error('Error deleting weight:', error);
        res.redirect('/weights/retrieve_weight');
    }
});


module.exports = router;
