const express = require('express');

const speakersRoute = require('./speaker');
const feedbackRoute = require('./feedback');
const router = express.Router();

/**
 * @param {{ 
 * speakersService: import('../services/SpeakerService')
 * }} params
 */
module.exports = params => {
    const { speakersService } = params;
    router.get('/', async (request, response, next) => {
        try {
            const artWork = await speakersService.getAllArtwork();
            const topSpeakers = await speakersService.getList();
            if (!request.session.visitCount) {
                request.session.visitCount = 0;
            }

            request.session.visitCount += 1;
            console.log(`Number of visits ${request.session.visitCount}`);
            return response.render('layout', { pageTitle: 'Welcome', template: 'index', topSpeakers, artWork });
        } catch(err) {
            return next(err);
        }
    });

    router.use('/speakers', speakersRoute(params));
    router.use('/feedback', feedbackRoute(params));

    return router;
};