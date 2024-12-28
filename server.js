const express = require('express');
const path = require('path');
const cookieSession = require('cookie-session');
const routes = require('./routes');
const crypto = require('crypto');
const createError = require('http-errors');

const bodyParser = require('body-parser');

const FeedbackService = require('./services/FeedbackService');
const SpeakersService = require('./services/SpeakerService');

const feedbackService = new FeedbackService('./data/feedback.json');
const speakersService = new SpeakersService('./data/speakers.json');

const app = express();
const port = 3000;

app.set('trust proxy', 1);

app.use(
    cookieSession({
        name: 'session',
        keys: [
            'T1Jw9WpgBpHlG9qrxphU5weT3BT64vlfv+gX7ezX8lg=',
            'klV1c/NFZJjRjTbBqrnHtzIv6yXUN5nct98jI6I8XpU=',
        ],
    })
);

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json());

const userKey = crypto.randomBytes(32).toString('base64');
app.use((req, res, next) => {
    if (!req.session.userKey) {
        req.session.userKey = userKey;
    }
    next();
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'));
app.locals.siteName = 'ROUX Meetings';
app.use(express.static(path.join(__dirname, './static')));

app.use(async (req, res, next) => {
    try {
        const names = await speakersService.getNames();
        res.locals.speakerNames = names;
        return next();
    } catch(err) {
        return next(err);
    }
});

app.use('/', routes({
    feedbackService,
    speakersService
}));

app.get('/abc/:speakerName?', (request, response, next) => {
    const { speakerName } = request.params;
    response.send(`hello, ${speakerName}`);
});

app.use((req, res, next) => {
    return next(createError(404, 'File not found'));
});

app.use((err, req, res, next) => {
    res.locals.message = err.message;
    const status = err.status || 500;
    res.locals.status = status;
    res.status(status);
    res.render('error');
});

app.listen(port, () => {
    console.log('Application started');
});