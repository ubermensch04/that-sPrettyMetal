const express = require('express');
const Subgenre=require('../models/subgenreModel.js')
const router = express.Router();
const {protect, authorize} = require('../middleware/authMiddleware.js');


router.get('/', async (req, res, next) => {
    try{
        const{
            keyBand,
            influencerBand, 
            nameSearch, 
            descriptionSearch, 
            sortBy, 
            order} 
            = req.query;
        
        //FILTERING
        const filter = {};
        if(keyBand) {
            filter.keyBands = { $in: [keyBand] };
        }
        if(influencerBand) {
            filter.influencerBands = { $in: [influencerBand] };
        }
        if(nameSearch) {
            filter.name = { $regex: nameSearch, $options: 'i' }; 
        }
        if(descriptionSearch) {
            filter.description = { $regex: descriptionSearch, $options: 'i' }; 
        }

        let sortOptions = {};
        if(sortBy) {
            const sortOrder = order === 'desc' ? -1 : 1;
            sortOptions[sortBy] = sortOrder;
        }
        else{
            sortOptions.name = 1;
        }
        const subgenres = await Subgenre.find(filter).sort(sortOptions);
        res.json(subgenres);
    }
    catch (error) {
        console.error('Error in GET /api/subgenres:', error.message);
        next(error);
    }
});

router.get('/:id', async (req, res, next) => {
    try{
        const foundSubgenre= await Subgenre.findById(req.params.id);
        if (!foundSubgenre) {
            const error = new Error('Subgenre not found.');
            error.statusCode= 404;
            return next(error);
        }
        res.json(foundSubgenre);
    }
    catch (error) {
        console.error(`Error in GET /api/subgenres/${req.params.id}:`, error.message);
        next(error);
    }
});

router.post('/',protect,authorize('admin'), async (req, res, next) => {
    const {name,description,keyBands,influencerBands,pioneeringAlbums} = req.body;
    const newSubgenre = new Subgenre({
            name,
            description,
            keyBands,
            influencerBands,
            pioneeringAlbums
        });
    try
    {
        const existingSubgenre= await Subgenre.findOne({ name: newSubgenre.name })
        if(existingSubgenre) {
            const error = new Error('Subgenre name already exists.');
            error.statusCode = 409;
            return next(error);
        }
        const savedSubgenre = await newSubgenre.save();
        res.status(201).json(savedSubgenre);
    }
    
    catch (err) 
    {
        console.error('Error in POST /api/subgenres:', err.message);
        next(err);
    }

});


router.put('/:id', protect, authorize('admin'), async (req, res, next) => {
    const subgenreId = req.params.id;
    try{
        if(req.body.name) {
            const existingSubgenre = await Subgenre.findOne({ name: req.body.name });
            if (existingSubgenre && existingSubgenre._id.toString() !== subgenreId) {
                const error = new Error('Subgenre name already exists.');
                error.statusCode = 409;
                return next(error);
            }
        }

        // Check if keyBands is provided but not an array
        if (req.body.keyBands !== undefined && !Array.isArray(req.body.keyBands)) {
            const error = new Error("Invalid data format");
            error.statusCode = 400;
            error.errors = { keyBands: "keyBands must be an array" };
            return next(error);
        }
        
        // Check if influencerBands is provided but not an array
        if (req.body.influencerBands !== undefined && !Array.isArray(req.body.influencerBands)) {
            const error = new Error("Invalid data format");
            error.statusCode = 400;
            error.errors = { influencerBands: "influencerBands must be an array" };
            return next(error);
        }

        const updatedSubgenre= await Subgenre.findByIdAndUpdate(subgenreId, req.body, { new: true, runValidators: true });
        if(!updatedSubgenre) {
            const error = new Error('Subgenre not found for update.');
            error.statusCode = 404;
            return next(error);
        }
        res.json(updatedSubgenre);
    
    }
    catch (err) 
    {
        console.error(`Error updating Subgenre with ID ${subgenreId}:`, err);
        next(err);
    }
});

router.delete('/:id', protect, authorize('admin'), async (req, res, next) => {
    const subgenreId = req.params.id;
    try{
        const deletedSubgenre = await Subgenre.findByIdAndDelete(subgenreId);
        if (!deletedSubgenre) {
            const error = new Error('Subgenre not found for deletion.');
            error.statusCode = 404;
            return next(error);
        }
        res.status(204).send();
    }
    catch(error)
    {
        console.error(`Error deleting Subgenre with ID ${subgenreId}:`, error);
        next(error);
    }
});

module.exports = router;