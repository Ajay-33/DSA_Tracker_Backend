import responsemodel from "../models/responsemodel.js";
import questionsmodel from "../models/questionsmodel.js";
import categorymodel from "../models/categorymodel.js";
import mongoose from "mongoose";

export const getAllData = async (req, res, next) => {
  const User_info = req.user && req.user.userId;
  if (!User_info) {
    next("User ID not available");
    return;
  }
  try {
    const [Total_Questions, Questions_done, categories] = await Promise.all([
      questionsmodel.countDocuments(),
      responsemodel.countDocuments({
        CreatedBy: User_info,
        Question_Status: "Completed",
      }),
      categorymodel.find().sort({ category_name: 1 }).lean(),
    ]);

    const Total_percentage = parseFloat(
      ((Questions_done / Total_Questions) * 100).toFixed(2)
    );

    const Total_values = {
      Total_Questions,
      Questions_done,
      Total_percentage,
    };
    const category_values = await getCategoryResponses(User_info, categories);
    const responses = {
      Total_values: Total_values,
      category_values: category_values,
    };
    res.status(200).json({
      responses,
      data: categories,
    });
  } catch (error) {
    next(error.message);
  }
};

const getCategoryResponses = async (userId, categories) => {
  // Extract all question IDs from categories
  const questionIds = categories.reduce((ids, category) => {
    return ids.concat(category.questions);
  }, []);

  // Fetch responses related to the extracted question IDs and created by the user
  const responses = await responsemodel
    .find({
      CreatedBy: userId,
      Question_id: { $in: questionIds },
    })
    .lean();

  // Process the responses to calculate category statistics
  const categoryValues = {};

  for (const category of categories) {
    const categoryQuestionsCount = category.questions.length;

    const Modified_Questions = responses.filter((response) => {
      return category.questions.find((questionId) =>
        questionId.equals(response.Question_id)
      );
    });

    const categoryDoneCount = Modified_Questions.filter(
      (question) => question.Question_Status === "Completed"
    ).length;
    const categoryPercentage = parseFloat(
      ((categoryDoneCount / categoryQuestionsCount) * 100).toFixed(2)
    );
    categoryValues[category.category_name] = {
      cid: category._id,
      categoryQuestions: categoryQuestionsCount,
      categoryDone: categoryDoneCount,
      Modified_Questions: Modified_Questions,
      categoryPercentage,
    };
  }

  return categoryValues;
};

// const getRevisitedQuestionInfo = async (userId) => {
//   const visitedQuestions = await responsemodel.countDocuments({
//     CreatedBy: userId,
//     Question_Status: "Revisit",
//   });
//   return {
//     CreatedBy: userId,
//     Revisit_Questions: visitedQuestions,
//   };
// };

export const CategoriesData = async (req, res, next) => {
  const User_info = req.user && req.user.userId;
  if (!User_info) {
    next("User ID not available");
    return;
  }
  const { id } = req.params;
  try {
    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({ message: "Category not Found" });
    }
    const category = await categorymodel.findById(id).populate("questions");
    category.questions.sort((a, b) => {
      const difficultyOrder = { Easy: 1, Medium: 2, Hard: 3 };
      return (
        difficultyOrder[a.question_difficulty] -
        difficultyOrder[b.question_difficulty]
      );
    });
    const categoryQuestions = category.questions.length;
    const Modified_Questions = await responsemodel.find({
      CreatedBy: User_info,
      // Question_Status: 'Completed',
      Question_id: { $in: category.questions },
    });
    const categoryDone = Modified_Questions.filter(
      (question) => question.Question_Status === "Completed"
    ).length;
    const categoryPercentage = parseFloat(
      ((categoryDone / categoryQuestions) * 100).toFixed(2)
    );
    const categoryValue = {
      cid: category._id,
      categoryQuestions: categoryQuestions,
      categoryDone: categoryDone,
      Modified_Questions: Modified_Questions,
      categoryPercentage: categoryPercentage,
    };
    res.status(200).json({ responses: categoryValue, c_data: category });
  } catch (error) {
    return next(error.message);
  }
};

export const getUserResponses = async (req, res, next) => {
  const User_info = req.user && req.user.userId;
  if (!User_info) {
    next("User ID not available");
    return;
  }
  try {
    const [Total_Questions, Questions_done, categories] = await Promise.all([
      questionsmodel.countDocuments(),
      responsemodel.countDocuments({
        CreatedBy: User_info,
        Question_Status: "Completed",
      }),
      categorymodel.find().lean(),
    ]);
    const Total_percentage = parseFloat(
      ((Questions_done / Total_Questions) * 100).toFixed(2)
    );
    const Total_values = {
      Total_Questions: Total_Questions,
      Questions_done: Questions_done,
      Total_percentage: Total_percentage,
    };
    const category_values = await getCategoryResponses(User_info, categories);
    res.status(200).json({
      Total_values,
      category_values,
    });
  } catch (error) {
    next(error.message);
  }
};

export const catResponses = async (req, res, next) => {
  const User_info = req.user && req.user.userId;
  if (!User_info) {
    next("User ID not available");
    return;
  }
  const { id } = req.params;
  try {
    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({ message: "Category not Found" });
    }
    const category = await categorymodel.findById(id).populate("questions");
    const categoryQuestions = category.questions.length;
    const Modified_Questions = await responsemodel.find({
      CreatedBy: User_info,
      // Question_Status: 'Completed',
      Question_id: { $in: category.questions },
    });
    const categoryDone = Modified_Questions.filter(
      (question) => question.Question_Status === "Completed"
    ).length;
    const categoryPercentage = parseFloat(
      ((categoryDone / categoryQuestions) * 100).toFixed(2)
    );
    const categoryValue = {
      cid: category._id,
      categoryQuestions: categoryQuestions,
      categoryDone: categoryDone,
      Modified_Questions: Modified_Questions,
      categoryPercentage: categoryPercentage,
    };
    res.status(200).json(categoryValue);
  } catch (error) {
    return next(error.message);
  }
};
