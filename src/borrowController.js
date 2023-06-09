import Book from './bookModel.js';
import Borrow from './borrowModel.js';

import mongoose from 'mongoose';
import {
  getDetailedBorrow,
  getDetailedBorrows,
} from './helpers/getDetailedBorrow.js';
import {
  httpBadRequest,
  httpException,
  httpNotFound,
} from './helpers/httpExceptionBuilder.js';
import { successResponseBuilder } from './helpers/responseBuilder.js';

// Admin can see all; user only can see theirs
export const findAll = async (req, res, next) => {
  try {
    const filter = {};

    // if user -> only show theirs
    if (!req.user.role === 'ADMIN') filter.userId = req.user.id;

    // isReturned
    if (req.query.returned === 'true') filter.isReturned = true;
    if (req.query.returned === 'false') filter.isReturned = false;

    const borrows = await Borrow.find(filter);

    const detailedBorrows = await getDetailedBorrows(borrows);

    res.json(successResponseBuilder({ borrows: detailedBorrows }));
  } catch (err) {
    next(err);
  }
};

// Admin can see all; user only can see theirs
export const findById = async (req, res, next) => {
  try {
    const filter = {};

    // if user -> only show theirs
    if (!req.user.role === 'ADMIN') filter.userId = req.user.id;

    filter._id = mongoose.Types.ObjectId(req.params.id);

    const borrow = await Borrow.findOne(filter);
    if (!borrow) throw httpNotFound();

    const detailedBorrow = await getDetailedBorrow(borrow);

    res.json(successResponseBuilder({ borrow: detailedBorrow }));
  } catch (err) {
    next(err);
  }
};

export const borrowBook = async (req, res, next) => {
  try {
    // Verify book availibility
    const book = await Book.findOne({ _id: req.body.bookId });
    if (!book) throw httpNotFound('Book not found');
    if (book.numOfAvailableBooks < 1) {
      throw httpException(409, 'Out of book');
    }

    // Add borrow
    const borrow = new Borrow({
      userId: req.user.id,
      bookId: req.body.bookId,
      borrowedAt: new Date(),
      isReturned: false,
    });
    const borrowResult = await borrow.save();

    // Add borrwerId and -1 numOfAvailableBooks
    await Book.updateOne(
      { _id: req.body.bookId },
      {
        numOfAvailableBooks: book.numOfAvailableBooks - 1,
        borrowerIds: [...book.borrowerIds, req.user.id],
      }
    );

    console.log(borrowResult);

    const detailedBorrow = await getDetailedBorrow(borrowResult);
    res.status(201).json(successResponseBuilder({ borrow: detailedBorrow }));
  } catch (err) {
    if (['CastError', 'ValidationError'].includes(err?.name)) {
      next(httpBadRequest(err.message));
    }
    next(err);
  }
};

export const returnBook = async (req, res, next) => {
  try {
    // Change status isReturned to true
    const borrow = await Borrow.findOneAndUpdate(
      {
        // look for this doc
        userId: mongoose.Types.ObjectId(req.user.id),
        bookId: mongoose.Types.ObjectId(req.body.bookId),
        isReturned: false,
      },
      {
        // and update the doc's value
        isReturned: true,
        returnedAt: new Date(),
      }
    );
    if (!borrow) throw httpNotFound('Borrow not found');

    // Remove one borrowerId from book
    const book = await Book.findOne({ _id: req.body.bookId });

    const borrowerIndex = book.borrowerIds.indexOf(req.user.id);
    book.borrowerIds.splice(borrowerIndex, 1);

    await Book.updateOne(
      { _id: mongoose.Types.ObjectId(req.body.bookId) },
      {
        numOfAvailableBooks: book.numOfAvailableBooks + 1,
        borrowerIds: book.borrowerIds,
      }
    );

    const detailedBorrow = await getDetailedBorrow(borrow);

    res.status(200).json(successResponseBuilder({ borrow: detailedBorrow }));
  } catch (err) {
    if (['CastError', 'ValidationError'].includes(err?.name)) {
      next(httpBadRequest(err.message));
    }
    next(err);
  }
};
