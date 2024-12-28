const express = require('express');

const router = express.Router();

/**
 * @param {{ 
 * speakersService: import('../services/SpeakerService'),
 * feedbackService: import('../services/FeedbackService') 
 * }} params
 */
module.exports = params => {

    const { speakersService, feedbackService } = params;

    router.get('/', async (request, response, next) => {
        try {
            const artWork = await speakersService.getAllArtwork();
            const speakers = await speakersService.getList();
            return response.render('layout', { pageTitle: 'speakers', template: 'speakers', speakers, artWork });
        } catch(err) {
            return next(err);
        }
    });

    router.get('/:shortName', async (request, response) => {
        const shortName = request.params.shortName;
        const artWork = await speakersService.getArtworkForSpeaker(shortName);
        const speaker = await speakersService.getSpeaker(shortName);
        response.render('layout', { pageTitle: 'speakers', template: 'speakers-detail', speaker, artWork });
    });

    return router;
};