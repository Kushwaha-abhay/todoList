const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
let day = require(__dirname + "/date.js");
const _ = require("lodash");

//mongoose.connect("mongodb://localhost:27017/todoListDB", {
mongoose.connect("mongodb+srv://admin:admin@cluster0.tayec.mongodb.net/todoListDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const app = express();
app.set("view engine", "ejs");

const itemSchema = {
  name: String
};

const Item = mongoose.model("Item", itemSchema);

const customListSchema = {
  name: String,
  listitems: [itemSchema]
}

const CustomListModel = mongoose.model("CustomListModel", customListSchema);

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

const item1 = new Item({
  name: "Welcome to TodoList"
});
const item2 = new Item({
  name: "Hit the + button to create new item"
});
const item3 = new Item({
  name: "<-- Press to delete item"
});
const defaultitems = [item1, item2, item3];
let time = day.getDate();

app.get("/", function(req, res) {
  let item = "";

  Item.find({}, function(err, foundItems) {

    if (foundItems.length == 0) {
      console.log("founditem=" + foundItems.length);

      Item.insertMany(defaultitems, function(err) {
        if (!err)
          console.log(err);
      });
      //  res.render("TimeofDay", {title: time,newElement: foundItems});
      res.redirect("/");
    } else {
      console.log("founditemelse=" + foundItems.length);
      //  mongoose.connection.close();
      res.render("TimeofDay", {
        title: time,
        newElement: foundItems
      });
    }
  });
});

app.get("/:List", function(req, res) {
  const listName = _.capitalize(req.params.List);
  CustomListModel.findOne({
    name: listName
  }, function(err, foundList) {
    if (!foundList) {
        const customListModel = new CustomListModel({
        name: listName,
        listitems: defaultitems
      });
      customListModel.save(function(err) {
        if (err)
          console.log("errOr=" + err);
      });
      //   res.render("TimeofDay", {title: listName,newElement: defaultitems});
      res.redirect("/" + listName);
    } else {
        res.render("TimeofDay", {
        title: foundList.name,
        newElement: foundList.listitems
      });
    }
  })



})
app.post("/", function(req, res) {
  const newitem = req.body.newElement;
  const listName = req.body.list;

  const item1 = new Item({
    name: newitem
  });

  console.log(listName + "==" + time);
  if (listName == time) {
        item1.save(function(err) {
      if (err)
        console.log(err);
      else
        console.log("new element created");
    })
    //  items.push(item);
    //console.log(req.body);
    res.redirect("/");
  } else {

    CustomListModel.findOne({
      name: listName
    }, function(err, foundList1) {

      foundList1.listitems.push(item1);
      foundList1.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/deleteItem", function(req, res) {

  const deleteid = req.body.deleteItem;
  const listName = req.body.listName;
  if (listName == time) {
    Item.findByIdAndRemove(deleteid, function(err) {
      if (!err)
        console.log("delete success");
      res.redirect("/");
    })
  } else {
    CustomListModel.findOneAndUpdate({
      name: listName
    }, {
      $pull: {
        listitems: {
          _id: deleteid
        }
      }
    }, function(err, foundList) {
      if (!err) {
        res.redirect("/" + listName);
      }
    });
  }
})
app.get("/Work", function(req, res) {
  res.render("TimeofDay", {
    title: "Work List",
    newElement: workItems
  });
})

app.get("/about", function(req, res) {
  res.render("about");
})

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port);
