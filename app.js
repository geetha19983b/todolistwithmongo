const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _=require("lodash");
const app = express();
app.use(bodyParser.urlencoded({
  extended: true
}));
//to read the static files from public folder
app.use(express.static("public"));
app.set('view engine', 'ejs');

//mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser:true});

mongoose.connect("mongodb+srv://admin-Rithvik:[psswdreplace]@cluster0-4dnhw.mongodb.net/todolistDB",{useNewUrlParser:true});
//create and save to database starts
const itemsSchema = {
  name:String
};

const Item = mongoose.model("Item",itemsSchema);
//create default items to store
const nodeitem= new Item({
  name:"Master Node"
});
const angularitem = new Item({
  name:"Angular"
});
const core = new Item({
  name:".net Core"
});
const defaultItems=[nodeitem,angularitem,core];

const listSchema = {
  name:String,
  items:[itemsSchema]
};
const List = mongoose.model("List",listSchema);


//let items = ["Buy food", "Cook food", "Eat food"];

app.get("/", function(req, res) {
let day =date.getDate();


Item.find({},function(err,foundItems){
  //console.log(foundItems);
  if(foundItems.length == 0)
  {
    Item.insertMany(defaultItems,function(err){
      if(err){
        console.log(err);
      }
      else
      {
         console.log("Successfully saved all the items");
      }
    });
    res.redirect("/");
  }
  else
  {
    res.render('list', {
      //listTitle: day,
      listTitle: "Today",
      newListItems: foundItems
    });
  }

});

});
app.get("/:customListName",function(req,res)  {
  const customListName=_.capitalize(req.params.customListName);

  List.findOne({name:customListName},function(err,foundList){
  if(!err){
    if(!foundList)
    {
      //  console.log('does not exist');
        const list =  new List({
          name:customListName,
          items:defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
    }
    else
    {
      //console.log('exists');
     res.render('list',{listTitle:foundList.name,newListItems:foundList.items});
   }
  }
});
});
// app.get("/work",function(req,res){
//    res.render('list',{listTitle:"Work List",newListItems:workItems});
// });
// app.get("/about",function(req,res){
//   res.render("about");
// });
// app.post("/work", function(req, res) {
//   let item = req.body.newItem;
//   workItems.push(item);
//   res.redirect("/work");
// });
app.post("/", function(req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const newItem = new Item({
    name:itemName
  });
  if(listName === "Today")
  {
    newItem.save();
    res.redirect("/");
  }
  else
  {
    List.findOne({name:listName},function(err,foundList){
      console.log(foundList);
      console.log(itemName);
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/" + listName);
    });
  }

});
app.post("/delete",function(req,res){
  const checkedItemId = req.body.delcheckbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(!err){
        console.log("Successfully deleted checked item.");
        res.redirect("/");
      }
    });
  }
  else
  {
    List.findOneAndUpdate({name:listName},{$pull: {items:{_id:checkedItemId}}},function(err,foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }


});
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server has started");
});
