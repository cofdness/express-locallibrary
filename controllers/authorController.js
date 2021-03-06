const Author = require('../models/author');
const async = require('async');
const Book = require('../models/book');
const {body, validationResult} = require('express-validator');

// Display list of all Authors.
exports.author_list = function(req, res, next) {
    Author.find()
        .sort([['family_name', 'ascending']])
        .exec(function (err, list_authors) {
            if (err) {return next(err);}
            //successful, so render
            res.render('author_list', {title: 'Author List', author_list: list_authors})
        })
};

// Display detail page for a specific Author.
exports.author_detail = function(req, res, next) {
    async.parallel({
        author: callback => {
            Author.findById(req.params.id)
                .exec(callback);
        },
        author_books: callback => {
            Book.find({'author': req.params.id}, 'title summary')
                .exec(callback);
        }
    }, (err, results) => {
        if (err) return next(err);
        if (results.author === null) {
            const error = new Error('Author not found');
            error.status = 404;
            return next(error);
        }
        //successful, so render
        res.render('author_detail', {title: 'Author Detail', author: results.author, author_books: results.author_books})
    })
};

// Display Author create form on GET.
exports.author_create_get = function(req, res, next) {
    res.render('author_form', {title: 'Create author'});
};

// Handle Author create on POST.
exports.author_create_post = [
    body('first_name').trim().isLength({min: 1}).escape().withMessage('First name must be specified.')
        .isAlphanumeric().withMessage('Fist name has non-alphanumeric characters.'),
    body('family_name').trim().isLength({min: 1}).escape().withMessage('Family name must be specified.')
        .isAlphanumeric().withMessage('Family name has non_alphanumeric characters.'),
    body('date_of_birth', 'Invalid date of birth').optional({checkFalsy: true}).isISO8601().toDate(),
    body('date_of_death', 'Invalid date of death').optional({checkFalsy: true}).isISO8601().toDate(),

    //Process request after validation and sanitization.
    (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            //There are errors. Render form again with sanitized values/errors messages
            res.render('author_form', {title: 'Create Author', author: req.body, errors: errors.array()});
            return;
        } else {
            // no error from post data.
            const author = new Author({
                first_name: req.body.first_name,
                family_name: req.body.family_name,
                date_of_birth: req.body.date_of_birth,
                date_of_death: req.body.date_of_death
            });
            author.save((err) => {
                if (err) return next(err);

                //successful - redirect to new author url
                res.redirect(author.url);
            })
        }
    }
]

// Display Author delete form on GET.
exports.author_delete_get = function(req, res, next) {
    async.parallel({
        author: callback => {
            Author.findById(req.params.id).exec(callback);
        },
        author_books: callback => {
            Book.find({'author': req.params.id}).exec(callback);
        }
    }, (err, results) => {
        if (err) return next(err);
        if (results.author === null) {
            res.redirect('/catalog/authors');
        }
        //successful, so render.
        res.render('author_delete', {title: 'Delete Author', author: results.author, author_books: results.author_books})
    })
};

// Handle Author delete on POST.
exports.author_delete_post = (req, res, next) => {
    async.parallel({
        author: callback => {
            Author.findById(req.params.id).exec(callback);
        },
        author_books: callback => {
            Book.find({'author': req.params.authorid}).exec(callback);
        }
    }, (err, results) => {
        if (err) return next(err);

        //success
        if (results.author_books.length > 0) {
            //Author has books. Render in same way as for GET route.
            res.render('author_delete', {title: 'Delete Author', author: results.author, author_books: results.author_books});
            return;
        } else {
            //Author has no books. Delete author object
            Author.findByIdAndRemove(req.body.authorid, (err) => {
                if (err) return next(err);
                //Success
                res.redirect('/catalog/authors');
            })
        }
    })
}

// Display Author update form on GET.
exports.author_update_get = function(req, res, next) {
    async.parallel({
        author: callback => {
            Author.findById(req.params.id)
                .exec(callback);
        },
        author_books: callback => {
            Book.find({'author': req.params.id}, 'title summary')
                .exec(callback);
        }
    }, (err, results) => {
        if (err) return next(err);
        if (results.author === null) {
            const error = new Error('Author not found');
            error.status = 404;
            return next(error);
        }
        //successful, so render
        res.render('author_form', {title: 'Update author', author: results.author, author_books: results.author_books})
    })
};

// Handle Author update on POST.
exports.author_update_post = [
    body('first_name').trim().isLength({min: 1}).escape().withMessage('First name must be specified.')
        .isAlphanumeric().withMessage('Fist name has non-alphanumeric characters.'),
    body('family_name').trim().isLength({min: 1}).escape().withMessage('Family name must be specified.')
        .isAlphanumeric().withMessage('Family name has non_alphanumeric characters.'),
    body('date_of_birth', 'Invalid date of birth').optional({checkFalsy: true}).isISO8601().toDate(),
    body('date_of_death', 'Invalid date of death').optional({checkFalsy: true}).isISO8601().toDate(),

    //Process request after validation and sanitization.
    (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            //There are errors. Render form again with sanitized values/errors messages
            res.render('author_form', {title: 'Update Author', author: req.body, errors: errors.array()});
            return;
        } else {
            // no error from post data.
            const author = new Author({
                first_name: req.body.first_name,
                family_name: req.body.family_name,
                date_of_birth: req.body.date_of_birth,
                date_of_death: req.body.date_of_death,
                _id: req.params.id
            });
            Book.findByIdAndUpdate(req.params.id, author, {}, (err, update_author) => {
                if (err) return next(err);
                //update successful, redirect
                res.redirect(update_author.url);
            })
        }
    }
]
