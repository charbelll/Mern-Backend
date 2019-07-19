const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const routes = express.Router();
const PORT = 4000;
const validator = require("validator");
//let!
const person = require("./person.model");
const city = require("./city.model");
const country = require("./coutry.model");
let countryname = null;

let list = [];

function createJson(pid, pname, pmobile, pcity, pcountry) {
  return [
    {
      id: pid,
      name: pname,
      mobile: pmobile,
      city: pcity,
      country: pcountry
    }
  ];
}

app.use(cors());
app.use(bodyParser.json());

mongoose.connect("mongodb://127.0.0.1:27017/info", { useNewUrlParser: true });
const connection = mongoose.connection;

connection.once("open", function() {
  console.log("MongoDB connection established successfully");
});

//delete user
routes.route("/editor/delete/:id").post(function(req, res) {
  person.deleteOne({ id: req.params.id }, function(err) {
    if (err) {
      console.log(err);
    } else {
      res.json({ status: "deleted" });
    }
  });
});

//update user

routes.route("/editor/update/:id").post(function(req, res) {
  city.find({ name: req.body.cityname }, function(err, cres) {
    if (err || !cres || cres.length <= 0) {
      console.log(err);
    } else {
      console.log(cres[0].id);
      let update = {
        name: req.body.name,
        mobile: req.body.mobile,
        cityid: cres[0].id,
        notes: req.body.notes,
      };
      person.update({ id: req.params.id }, update).then(doc => {
        if (!doc) {
          return res.status(404).end();
        } else {
          return res.status(200).json(doc);
        }
      });
    }
  });
});

//get highest value id to create new unique id
routes.route("/add/").post(function(request, result) {
  let highest_id;
  let cid;
  person
    .find({})
    .sort({ id: -1 })
    .limit(1)
    .exec(function(err, res) {
      if (err || !res || res.length <= 0) {
        console.log(err);
      } else {
        highest_id = res[0].id + 1;
        let cityname = request.body.cityname;
        city
          .find({ name: cityname })
          .sort({ id: -1 })
          .limit(1)
          .exec(function(err, res) {
            if (err || !res || res.length <= 0) {
              console.log(err);
            } else {
              cid = res[0].id;
              console.log(cid);
              if (
                request.body.mobile == null ||
                request.body.mobile.toString().length < 8 ||
                request.body.mobile.toString().length > 8
              ) {
                result.json({ status: "Mobile number must be 8 characters" });
              } else if (!validator.isInt(request.body.mobile.toString())) {
                result.json({ status: "The value must be a number" });
              } else {
                let nperson = new person({
                  id: highest_id,
                  name: request.body.name,
                  mobile: request.body.mobile,
                  cityid: cid,
                  notes: request.body.notes,
                });
                nperson
                  .save()
                  .then(pers => {
                    result
                      .status(200)
                      .json({ status: "person added succesfully" });
                  })
                  .catch(err => {
                    result.json("failed to add person");
                    console.log(err);
                  });
              }
            }
          });
      }
    });
  // let cityname = req.params.cityname.replace(/-/g, ' ');
});

//show all users in edit
routes.route("/edit/").get(function(req, res) {
  let notes;
  person.find(function(err, info) {
    if (err) {
      console.log(err);
    } else {
      let i = 0;
      info.forEach(function(element) {
        city.find({ id: element.cityid }, function(err, cres) {
          country.find({ id: cres[0].countryid }, function(err, cores) {
            cityname = cres[0].name;
            countryname = cores[0].name;
            if(element.notes == undefined){
              notes = '(Epmty)';
            }else{
              notes = element.notes;
            }
            result = {
              id: element.id,
              name: element.name,
              mobile: element.mobile,
              city: cityname,
              country: countryname,
              notes,
            };
            i++;
            list.push(result);

            // console.log(list);
            if (i == info.length) {
              res.json(list);
              list = [];
            }
          });
        });
      });
    }
  });
});

// get info by name
// routes.route("/:name").get(function(req, res) {
//   var name = req.params.name.replace(/-/g, " ");
//   person.find({ name: { $in: new RegExp(name, "i") } }, function(err, info) {
//     if (err || !info || info.length <= 0) {
//       console.log(err);
//       res.send("username not found");
//     } else {
//       city.find({ id: info[0].cityid }, function(err, cres) {
//         if (err) {
//           console.log(err);
//         } else {
//           cityname = cres[0].name;
//           country.find({ id: cres[0].countryid }, function(err, cress) {
//             if (err) {
//               console.log(err);
//             } else {
//               countryname = cress[0].name;
//               //    console.log(countryname);
//               result = createJson(
//                 info[0].id,
//                 info[0].name,
//                 info[0].mobile,
//                 cityname,
//                 countryname
//               );
//               res.json(result);
//             }
//           });
//         }
//       });
//     }
//   });
// });

// //get users in a defined city
// routes.route("/search/:cityid").get(function(req, res) {
//   id = req.params.cityid;
//   person.find({ cityid: id }, function(err, cres) {
//     if (err || !cres || cres.length <= 0) {
//       console.log(err);
//       res.send("city not found");
//     } else {
//       res.json(cres);
//     }
//   });
// });

routes.route("/search/predictPerson/:input").get(function(req, res) {
  var input = req.params.input.replace(/-/g, " ");
  let names = [];
  // console.log(input);
  person.find({ name: { $in: new RegExp(input, "i") } }, function(
    err,
    persons
  ) {
    if (err || !persons || persons.length <= 0) {
      console.log(err);
      console.log(person)
      res.json({names: ''})
    } else {
      let i = 0;
      let notes;

      persons.forEach(function(element) {
        city.find({ id: element.cityid }, function(err1, cres) {
          country.find({ id: cres[0].countryid }, function(err, cores) {
            if (err1 || !cres || cres.length <= 0) {
              console.log(err1);
              res.send(err)
            } else if (err || !cores || persons.length <= 0) {
              console.log(err);
            } else {
              cityname = cres[0].name;
              countryname = cores[0].name;
              if(element.notes == undefined){
                notes = '(Empty)';
              }else{
                notes = element.notes;
              }
              result = {
                id: element.id,
                name: element.name,
                mobile: element.mobile,
                city: cityname,
                country: countryname,
                notes,
              };
              i++;
              list.push(result);

              // console.log(list);
              if (i == persons.length) {
                Jnames = {
                  names: list
                };
                if(Jnames.names != null)
                {res.json(Jnames);}
                else{res.json({names: [{ }]})}
                list = [];
              }
            }
          });
        });
      });

      // Jnames = {
      //   names: persons
      // };
      // res.json(Jnames);
    }
  });
});

routes.route("/search/predictCity/:input").get(function(req, res){
  var input = req.params.input.replace(/-/g, " ");
  let list = [];
  city.find({ name: { $in: new RegExp(input, "i") }},function(error3, cityres){
    if(error3 || !cityres || cityres.length <= 0){
      console.log(error3);
      res.json({names: ''})

    }else{
    // console.log(input);
    // console.log(cityres)
    country.find({id: cityres[0].countryid},function(error4,countryres){
      person.find({cityid: cityres[0].id},function(error5,personres){
        if(error4 || !countryres || countryres.length <= 0){
          console.log(error4);
        }else if(error5 || !personres || personres.length <= 0){
          console.log(error5)
        }else{
        personres.forEach(function(element1){
          
          result2 = {
            id: element1.id,
            name: element1.name,
            mobile: element1.mobile,
            city: cityres[0].name,
            country: countryres[0].name,
            notes:element1.notes,
          }
          // console.log(result2);
          list.push(result2);
        })}
        Jlist = {
          names: list
        }
      res.json(Jlist);
      })

    })}
  })

})


app.use("/", routes);

app.listen(PORT, function() {
  console.log("Server is up on Port: " + PORT);
});
