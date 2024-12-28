const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();

/**
 * @param {{ feedbackService: import('../services/FeedbackService') }} params
 */
module.exports = params => {

    const { feedbackService } = params;

    router.get('/', async (request, response, next) => {
        try {
            const feedback = await feedbackService.getList();
            const errors = request.session.feedback ? request.session.feedback.errors : false;
            const successMessage = request.session.feedback ? request.session.feedback.message : false;
            request.session.feedback = {};

            return response.render('layout', { pageTitle: 'Feedback', template: 'feedback', feedback, errors, successMessage});
        } catch (err) {
            return next(err);
        }
    });

    router.post('/', [
        check('name').trim().isLength({ min: 3 }).escape().withMessage('name is required 3 length'),
        check('email').trim().isEmail().normalizeEmail().withMessage('email should be validated address'),
        check('title').trim().isLength({ min: 3 }).escape().withMessage('tittle is required 3 length'),
        check('message').trim().isLength({ min: 5 }).escape().withMessage('message is required 5 length'),
    ], async (request, response, next) => {
        try {
            const errors = validationResult(request);
            if (!errors.isEmpty()) {
                request.session.feedback = {
                    errors: errors.array(),
                }
                console.log(request.body);
                return response.redirect('/feedback');
            }

            const { name, email, title, message } = request.body;
            console.log(name, email, title, message);
            await feedbackService.addEntry(name, email, title, message);
            request.session.feedback = {
                message: 'Thank you for your feedback'
            }
            return response.redirect('/feedback');
        } catch(err) {
            return next(err);
        }
    });

    router.post('/api', [
        check('name').trim().isLength({ min: 3 }).escape().withMessage('name is required 3 length'),
        check('email').trim().isEmail().normalizeEmail().withMessage('email should be validated address'),
        check('title').trim().isLength({ min: 3 }).escape().withMessage('tittle is required 3 length'),
        check('message').trim().isLength({ min: 5 }).escape().withMessage('message is required 5 length'),
    ], async (request, response, next) => {
        try {
            const errors = validationResult(request);
            if (!errors.isEmpty()) {
                return response.json({ errors: errors.array() });
            }
            const { name, email, title, message } = request.body;
            await feedbackService.addEntry(name, email, title, message);
            const feedback = await feedbackService.getList();
            return response.json({ feedback, 'successMessage': 'Thank you for your feedback' });
        } catch(err) {
            return next(err);
        }
    });
    
    return router;
};