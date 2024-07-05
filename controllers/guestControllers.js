import questionsmodel from "../models/questionsmodel.js";
import categorymodel from "../models/categorymodel.js";
import mongoose from "mongoose";

export const getAllCategories = async (req, res) => {
  try {
    const [Total_Questions, categories] = await Promise.all([
      questionsmodel.countDocuments(),
      categorymodel.find().sort({ category_name: 1 }).lean(),
    ]);

    const Total_values = {
      Total_Questions,
      Questions_done: 0,
      Total_percentage: 0,
    };
    const category_values = await getGuestData(categories);
    const responses = {
      Total_values: Total_values,
      category_values: category_values,
    };

    res.status(200).json({
      responses,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const getGuestData = async (categories) => {
  const categoryValues = {};

  for (const category of categories) {
    const categoryQuestionsCount = category.questions.length;

    const categoryDoneCount = 0;
    const categoryPercentage = 0;
    categoryValues[category.category_name] = {
      cid: category._id,
      categoryQuestions: categoryQuestionsCount,
      categoryDone: categoryDoneCount,
      categoryPercentage,
    };
  }

  return categoryValues;
};

export const guestCategoriesData = async (req, res, next) => {
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
    const categoryDone = 0;
    const categoryPercentage = 0;
    const categoryValue = {
      cid: category._id,
      categoryQuestions: categoryQuestions,
      categoryDone: categoryDone,
      Modified_Questions: null,
      categoryPercentage: categoryPercentage,
    };
    res.status(200).json({ responses: categoryValue, c_data: category });
  } catch (error) {
    return next(error.message);
  }
};
