const Book = require('../models/book');
const Author = require('../models/author');
const Genre = require('../models/genre');
const BookInstance = require('../models/bookinstance');

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
exports.book_create_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Book create GET');
};

// Handle book create on POST.
exports.book_create_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Book create POST');
};

// Display book delete form on GET.
exports.book_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Book delete GET');
};

// Handle book delete on POST.
exports.book_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Book delete POST');
};

// Display book update form on GET.
exports.book_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Book update GET');
};

// Handle book update on POST.
exports.book_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Book update POST');
};