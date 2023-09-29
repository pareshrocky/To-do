//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

const pwd = "ASDFG%402hjkl"

mongoose.connect("mongodb+srv://admin-Paresh:" + `${pwd}` + "@cluster0.s98y6z6.mongodb.net/todoListDB?retryWrites=true&w=majority",{useNewUrlParser:true});

const itemSchema = {
  name : {
    type: String,
    required: true
  }
};

const listSchema = {
  userRoute : {
    type : String,
    required: true
  },
  items : [itemSchema]
}

const Item = mongoose.model("Item",itemSchema);

const List = mongoose.model("List",listSchema);

const item1 = new Item({
  name : "Buy food"
});

const item2 = new Item({
  name : "Office Work"
}) 

const item3 = new Item({
  name:"Drink Beer"
})

const defaultItems = [item1,item2,item3]

//  item1.save()

// Item.deleteOne({_id:"650ddca7cc098e36623e6497"
// }).then(result => {
//   try{
//     console.log(result);
//   }catch(err){
//     console.error(err);
//   }
// })

  
  // let Items = async () => {
  //   try{
  //     const items = await Item.find({});
  //     console.log(items);
  //   }catch(err){
  //     console.log(err);
  //   }
  // };
  // Items()


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


const workItems = [];

app.get("/", function(req, res) {

const day = date.getDate();
let Items = async () => {
  const myItem = await Item.find({});
  // const json = JSON.stringify(myItem);
  // return json
   return myItem
}

 Items().then(items => {
    if(items.length === 0){
       Item.insertMany(defaultItems, {throwOnValidationError : true})
       res.redirect("/");
    }else{
      //  console.log(items);
       res.render("list", {listTitle: day, listItems: items});
    }
  }).catch(err =>{
      console.log(err);
    });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const routeName = req.body.list;

  const newItem = new Item({
    name : itemName
  })

  if(routeName === date.getDate()){
    newItem.save();
    res.redirect("/");
  }else{
    List.findOne({userRoute : routeName}).then(
      item => {
        item.items.push(newItem);
        item.save();
        res.redirect("/" + routeName);
      }
    ).catch(err => console.log(err))
  } 
});

app.post("/delete",(req,res) => {
  const checkItemID = req.body.checkbox;
  const routeName = req.body.list;
  
  if(routeName === date.getDate()){
    Item.findByIdAndRemove(checkItemID).then( item =>{
      res.redirect("/");
      console.log(checkItemID);
      console.log("Successfully completed " + item.name );
    } 
    ).catch(err => {
      console.log(err);
    })
  }else{
    List.findOneAndUpdate({userRoute : routeName},
      {$pull:{items:{_id:checkItemID}}}).then(() => {
        res.redirect("/" + routeName)
      }).catch(err => console.log(err))
  }
  
})

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", listItems: workItems});
// });

app.get("/:customRoute", (req,res) => {
  const customListName = _.capitalize(req.params.customRoute);
List.findOne({userRoute : customListName}).then( item => {
  if(!item){
    const list = new List ({
      userRoute : customListName,
      items : defaultItems
    })
    list.save();
    res.redirect("/" + customListName);
  }else {
    res.render("list", {listTitle : item.userRoute , listItems : item.items })
  }
}
).catch(err => {
  console.log(err);
})

})

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
