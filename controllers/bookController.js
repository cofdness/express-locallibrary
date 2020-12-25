const Book = require('../models/book');
const Author = require('../models/author');
const Genre = require('../models/genre');
const BookInstance = require('../models/bookinstance');
const {body, validationResult} = require('express-validator');

const async = require('async');

exports.index = function(req, res) {
    async.parallel({
        book_count: function (callback) {
            Book.countDocuments({}, callback) //empty object mean count all book
        },
        book_instance_count: function (callback) {
            BookInstance.countDocuments({}, callback)
        },
        book_instance_available_count: function (callback) {
            BookInstance.countDocuments({status: 'Available'}, callback)
        },
        genre_count: function (callback) {
            Genre.countDocuments({}, callback)
        },
        author_count: function (callback) {
            Author.countDocuments({}, callback)
        }
    }, function(err, results) {
            res.render('index', {title: 'Local Library Home', error: err, data: results})
        }
    )
};

// Display list of all books.
exports.book_list = function(req, res, next) {
    Book.find({}, 'title author')
        .populate('author')
        .exec((err, list_books) => {
            if (err) {
                return next(err);
            }
            // successful, so render
            res.render('book_list', {title: 'Book List', book_list: list_books});
        });
};

// Display detail page for a specific book.
exports.book_detail = function(req, res, next) {
    async.parallel({
        book: callback => {
            Book.findById(req.params.id)
                .populate('author')
                .populate('genre')
                .exec(callback);
        },
        book_instances: callback => {
            BookInstance.find({'book': req.params.id})
                .exec(callback)
        }
    }, (err,results) => {
        if (err) return next(err)
        else if (results.book === null) {
            const error = new Error('Book not found');
            error.status = 404;
            return next(error);
        }
        // successful, so render
        res.render('book_detail', {title: results.book.title, book: results.book, book_instances: results.book_instances})
    })
};

// Display book create form on GET.
exports.book_create_get = function(req, res, next) {
    async.parallel({
        authors: callback => {
            Author.find()
                .exec(callback);
        },
        genres: callback => {
            Genre.find()
                .exec(callback);
        }
    }, (err, results) => {
        if (err) return next(err);

        //successful, so render
        res.render('book_form', {title: 'Create book', authors: results.authors, genres: results.genres});
    })
};

// Handle book create on POST.
exports.book_create_post = [
    //convert genres to array
    (req, res, next) => {
        if (!(req.body.genres instanceof Array)) {
            if(typeof req.body.genres === 'undefined') {
                req.body.genres = [];
            } else {
                req.body.genres = new Array(req.body.genres);
            }
        }
        next();
    },
    //validate and sanitise fields.
    body('title', 'Title must not be empty').trim().isLength({min: 1}).escape(),
    body('author', 'Author must not be empty').trim().isLength({min: 1}).escape(),
    body('summary', 'Summary must not be empty').trim().isLength({min: 1}).escape(),
    body('isbn', 'ISBN must not be empty').trim().isLength({min: 1}).escape(),
    body('genre.*').escape(),
    (req, res, next) => {
        const errors = validationResult(req);

        const book = new Book({
            title: req.body.title,
            author: req.body.author,
            summary: req.body.summary,
            isbn: req.body.isbn,
            genre: req.body.genre
        });

        if (!(errors.isEmpty())) {
            //There are errors. Render page again with sanitized values/error message.

            //Get all authors and genres for form.
            async.parallel({
                authors: callback => {
                    Author.find(callback);
                },
                genres: callback => {
                    Genre.find(callback);
                }
            }, (err, results) => {
                if (err) return next(err);

                genres.forEach((genre, index) => {
                    if (book.genre.indexOf(results.genres[index]._id) > -1) {
                        results.genres[index].checked = 'true';
                    }
                })
                res.render('book_form', {title: 'Create Book', authors: results.authors, genres: results.genres});
                return;
            })
        } else {
            //Data is valid. Save it
            book.save(err => {
                if (err) return next(err);

                //successful, redirect to new book
                res.redirect(book.url);
            })
        }

    }

]

// Display book delete form on GET.
exports.book_delete_get = function(req, res, next) {
    async.parallel({
        book: callback => {
            Book.findById(req.params.id)
                .populate('author')
                .populate('genre')
                .exec(callback);
        },
        book_instances: callback => {
            BookInstance.find({'book': req.params.id}).exec(callback);
        }
    }, (err, results) => {
        if (err) return next(err);
        //successful, so render
        res.render('book_delete', {title: 'Delete Book', book: results.book, book_instances: results.book_instances});
    })
};

// Handle book delete on POST.
exports.book_delete_post = function(req, res, next) {
    async.parallel({
        book: callback => {
            Book.findById(req.params.id)
                .populate('author')
                .populate('genre')
                .exec(callback);
        },
        book_instances: callback => {
            BookInstance.find({'book': req.params.id}).exec(callback);
        }
    }, (err, results) => {
        if (err) return next(err);

        // data valid, so check if bookinstance is empty
        if (results.book_instances.length > 0) {
            res.redirect(results.book.url, {title:'Delete Book', book: results.book, book_instances: results.book_instances});
        } else {
            Book.findByIdAndRemove(req.params.id)
                .exec((error) => {
                    if (error) return next(error);

                    //delete successful, return to book list
                    res.redirect('/catalog/books');
                });
        }
    })
};

// Display book update form on GET.
exports.book_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Book update GET');
};

// Handle book update on POST.
exports.book_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Book update POST');
};