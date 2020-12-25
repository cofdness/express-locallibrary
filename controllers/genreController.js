const Genre = require('../models/genre');
const Book = require('../models/book')
const async = require('async');
const {body, validationResult} = require("express-validator");

// Display list of all Genre.
exports.genre_list = function(req, res, next) {
    Genre.find()
        .exec(function (err, list_genres) {
            if (err) next(err);
            //successful so render
            res.render('genre_list', {title: 'Genre List', genre_list: list_genres})
        })
};

// Display detail page for a specific Genre.
exports.genre_detail = function(req, res, next) {
    async.parallel({
        genre: callback => {
            Genre.findById(req.params.id)
                .exec(callback);
        },
        genre_books: callback => {
            Book.find({'genre': req.params.id})
                .exec(callback);
        }},
        (err, results) => {
            if (err) {
                return next(err);
            }
            else if (results.genre === null){
                const error = new Error('Genre not found');
                error.status = 404;
                return next(error);
            }
            //success then render
            res.render('genre_detail', {title: 'Genre Detail', genre: results.genre, genre_books: results.genre_books})
    });
};

// Display Genre create form on GET.
exports.genre_create_get = function(req, res, next) {
    res.render('genre_form', {title: 'Create Genre'});
};

// Handle Genre create on POST.
exports.genre_create_post = [
    body('name', 'Genre name required').trim().isLength({min: 1}).escape(),
    (req, res, next) => {
        // extract the validation errors from a request
        const errors = validationResult(req);

        //create genre object with escaped and trimed data
        const genre = new Genre({name: req.body.name});

        if (!errors.isEmpty()) {
            //There are error, so render again with sanitized values/ error messages.
            res.render('genre_form', {title:'Create Genre', genre: genre, errors: errors.array()});
            return;
        } else {
            //Data from form is valid, so check if genre exist or save it...
            Genre.findOne({'name': req.body.name})
                .exec((err, found_genre) => {
                    if (err) return next(err);

                    //no err found
                    if (found_genre) {
                        //genre exists, redirect to its detail page.
                        res.redirect(found_genre.url);
                    } else {
                        genre.save(err => {
                            if (err) return next(err);
                            //Genre saved. Redirect to genre detail page.
                            res.redirect(genre.url);
                        })
                    }
                })
        }
    }
]

// Display Genre delete form on GET.
exports.genre_delete_get = function(req, res, next) {
    async.parallel({
            genre: callback => {
                Genre.findById(req.params.id)
                    .exec(callback);
            },
            genre_books: callback => {
                Book.find({'genre': req.params.id})
                    .exec(callback);
            }},
        (err, results) => {
            if (err) {
                return next(err);
            } else if (results.genre === null){
                const error = new Error('Genre not found');
                error.status = 404;
                return next(error);
            }
            //success then render
            res.render('genre_delete', {title: 'Genre Detail', genre: results.genre, genre_books: results.genre_books})
        });
};

// Handle Genre delete on POST.
exports.genre_delete_post = function(req, res, next) {
    async.parallel({
            genre: callback => {
                Genre.findById(req.params.id)
                    .exec(callback);
            },
            genre_books: callback => {
                Book.find({'genre': req.params.id})
                    .exec(callback);
            }},
        (err, results) => {
            if (err) {
                return next(err);
            }

            if (results.genre_books.length > 0) {
                res.render('genre_delete', {title: 'Genre Detail', genre: results.genre, genre_books: results.genre_books});
            } else {
                Genre.findByIdAndRemove(req.params.id)
                    .exec(error => {
                        if (error) return next(error);

                        res.redirect('/catalog/genres');
                    })
            }
        });
};

// Display Genre update form on GET.
exports.genre_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Genre update GET');
};

// Handle Genre update on POST.
exports.genre_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Genre update POST');
};
