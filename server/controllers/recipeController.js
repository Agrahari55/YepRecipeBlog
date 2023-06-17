require('../models/database');
const Category = require('../models/Category');
const Recipe = require('../models/recipe');

const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
console.log("checking start");
console.log(dotenv);
// Load environment variables from .env file
dotenv.config();



/**
 * GET /
 * Homepage 
*/
exports.homepage = async(req,res) => {
  try {
    const limitNumber = 5;
    const categories = await Category.find({}).limit(limitNumber);
    const latest = await Recipe.find({}).sort({_id: -1}).limit(limitNumber);
    const NorthIC = await Recipe.find({ 'category': 'NorthIC' }).limit(limitNumber);
    const SouthIC = await Recipe.find({ 'category': 'SouthIC' }).limit(limitNumber);
    const EastIC = await Recipe.find({ 'category': 'EastIC' }).limit(limitNumber);

    const food = { latest, NorthIC,SouthIC,EastIC};

    res.render('index', { title: 'Cooking Blog - Home', categories, food } );
  } catch (error) {
    res.status(500).send({message: error.message || "Error Occured" });
  }
}

/**
 * GET /categories
 * Categories 
*/
exports.exploreCategories = async(req, res) => {
  try {
    const limitNumber = 10;
    const categories = await Category.find({}).limit(limitNumber);
    res.render('categories', { title: 'Cooking Blog - Categoreis', categories } );
  } catch (error) {
    res.status(500).send({message: error.message || "Error Occured" });
  }
} 


/**
 * GET /categories/:id
 * Categories By Id
*/
exports.exploreCategoriesById = async(req, res) => { 
  try {
    let categoryId = req.params.id;
    const limitNumber = 10;
    const categoryById = await Recipe.find({ 'category': categoryId }).limit(limitNumber);
    res.render('categories', { title: 'Cooking Blog - Categoreis', categoryById } );
  } catch (error) {
    res.satus(500).send({message: error.message || "Error Occured" });
  }
} 
 
/**
 * GET /recipe/:id
 * Recipe 
*/
exports.exploreRecipe = async(req, res) => {
  try {
    let recipeId = req.params.id;
    const recipe = await Recipe.findById(recipeId);
    res.render('recipe', { title: 'Cooking Blog - Recipe', recipe } );
  } catch (error) {
    res.satus(500).send({message: error.message || "Error Occured" });
  }
} 



/**
 * POST /search
 * Search 
*/
exports.searchRecipe = async(req, res) => {
  try {
    let searchTerm = req.body.searchTerm;
    let recipe = await Recipe.find( { $text: { $search: searchTerm, $diacriticSensitive: true } });
    res.render('search', { title: 'Cooking Blog - Search', recipe } );
  } catch (error) {
    res.satus(500).send({message: error.message || "Error Occured" });
  }
  
}




/**
 * GET /explore-latest
 * Explore Latest 
*/
exports.exploreLatest = async(req, res) => {
  try {
    const limitNumber = 7;
    const recipe = await Recipe.find({}).sort({ _id: -1 }).limit(limitNumber);
    res.render('explore-latest', { title: 'Cooking Blog - Explore Latest', recipe } );
  } catch (error) {
    res.satus(500).send({message: error.message || "Error Occured" });
  }
} 


/**
 * GET /explore-random
 * Explore Random as JSON
*/
exports.exploreRandom = async(req, res) => {
  try {
    let count = await Recipe.find().countDocuments();
    let random = Math.floor(Math.random() * count);
    let recipe = await Recipe.findOne().skip(random).exec();
    res.render('explore-random', { title: 'Cooking Blog - Explore Latest', recipe } );
  } catch (error) {
    res.satus(500).send({message: error.message || "Error Occured" });
  }
} 



/**
 * GET /submit-recipe
 * Submit Recipe
*/
exports.submitRecipe = async(req, res) => {
  const infoErrorsObj = req.flash('infoErrors');
  const infoSubmitObj = req.flash('infoSubmit');
  res.render('submit-recipe', { title: 'Cooking Blog - Submit Recipe', infoErrorsObj, infoSubmitObj  } );
}




/**
 * POST /submit-recipe
 * Submit Recipe
*/

exports.submitRecipeOnPost = async (req, res) => {
  try {
    console.log("ghuse hai hm");
    // console.log(CLOUDINARY_API_SECRET);
    if (!req.files || Object.keys(req.files).length === 0) {
      console.log('No files were uploaded.');
      // Handle the case when no file was uploaded
      return res.redirect('/submit-recipe');
    }

    const imageUploadFile = req.files.image;

    console.log("dekhit hai image aayi ka");
    console.log(imageUploadFile);

    // Upload image to Cloudinary
    console.log("image upload kre jait hai");
    const uploadResult = await cloudinary.uploader.upload(imageUploadFile.tempFilePath);
    console.log("upload kaike lauta hai");
    console.log(uploadResult);

    console.log("result url dekho")
    console.log(uploadResult.secure_url);

    // Create new recipe object with Cloudinary image URL
    const newRecipe = new Recipe({
      name: req.body.name,
      description: req.body.description,
      email: req.body.email,
      ingredients: req.body.ingredients,
      category: req.body.category,
      image: uploadResult.secure_url
    });

    // Save the new recipe object to the database
    console.log("object dekho")
    console.log(newRecipe);
    await newRecipe.save();

    req.flash('infoSubmit', 'Recipe has been added.');
    res.redirect('/submit-recipe');
  } catch (error) {
    console.error(error);
    req.flash('infoErrors', error);
    res.redirect('/submit-recipe');
  }
};

// exports.submitRecipeOnPost = async(req, res) => {
//   try {

//     let imageUploadFile;
//     let uploadPath;
//     let newImageName;
//     let newRecipe;

//     if(!req.files || Object.keys(req.files).length === 0){
//       console.log('No Files where uploaded.');
//     } else {

//       imageUploadFile = req.files.image;
//       // newImageName = Date.now() + imageUploadFile.name;


//       cloudinary.uploader.upload(imageUploadFile.tempFilePath,(err,result)=>{
//         console.log(result);
//         console.log(err);
//         newRecipe = new Recipe({
//           name: req.body.name,
//           description: req.body.description,
//           email: req.body.email,
//           ingredients: req.body.ingredients,
//           category: req.body.category,
//           image: result.url
//         });
        
//       })
//       // uploadPath = require('path').resolve('./') + '/public/uploads/' + newImageName;

//       // imageUploadFile.mv(uploadPath, function(err){
//       //   if(err) return res.satus(500).send(err);
//       // })

//     }
//     await newRecipe.save();
    
//         req.flash('infoSubmit', 'Recipe has been added.')
//         res.redirect('/submit-recipe');

    
//   } catch (error) {
//     // res.json(error);
//     req.flash('infoErrors', error);
//     res.redirect('/submit-recipe');
//   }
// }


















async function insertDymmyCategoryData(){
  try {
    await Category.insertMany([
      {
        "name": "NorthIC",
        "image": "thai-food.jpg"
      },
      {
        "name": "SouthIC",
        "image": "american-food.jpg"
      }, 
      {
        "name": "EastIC",
        "image": "chinese-food.jpg"
      },
      {
        "name": "WestIC",
        "image": "mexican-food.jpg"
      }, 
      {
        "name": "CentralIC",
        "image": "indian-food.jpg"
      },
      {
        "name": "VegIC",
        "image": "spanish-food.jpg"
      }
    ]);
  } catch (error) {
    console.log('err', + error)
  }
}

// insertDymmyCategoryData();










async function insertDymmyRecipeData(){
  try {
    await Recipe.insertMany([
      { 
        "name": "Recipe Name Goes Here",
        "description": "Recipe Description Goes Here",
        "ingredients": [
          "1 level teaspoon baking powder",
          "1 level teaspoon cayenne pepper",
          "1 level teaspoon hot smoked paprika",
        ],
        "category": "American", 
        "image": "southern-friend-chicken.jpg"
      },
      { 
        "name": "Recipe Name Goes Here",
        "description": `Recipe Description Goes Here`,
        "ingredients": [
          "1 level teaspoon baking powder",
          "1 level teaspoon cayenne pepper",
          "1 level teaspoon hot smoked paprika",
        ],
        "category": "American", 
        "image": "southern-friend-chicken.jpg"
      },
    ]);
  } catch (error) {
    console.log('err', + error)
  }
}

// insertDymmyRecipeData();
