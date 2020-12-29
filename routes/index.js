var express = require("express");
var router = express.Router();

var itExpert = require("../models/itexpert");
var onlineEducator = require("../models/onlineeducator");
var buildingArchitect = require("../models/buildingarchitect");
var careerCounseller = require("../models/careercounseller");
var topexpert = require("../models/topexpert");
var session = require("../models/session");
var booking = require("../models/booking");
var query = require("../models/contactquery");
var user = require("../models/user");
var subscriber = require("../models/subscriber");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
var config = require("config");
var sessionAuth = require("../middlewares/sessionAuth");
var uploadUserImage = require("../middlewares/uploadUserImage");
var uploadExpertImage = require("../middlewares/uploadExpertImage");
var uploadSessionImage = require("../middlewares/uploadSessionImage");
var checkUserLogin = require("../middlewares/checkUserLogin");
var checkAdmin = require("../middlewares/checkAdmin");

/* GET home page. */
router.get("/", async function (req, res, next) {
  let mainevent = await session.findOne({
    category: "annual",
  });

  let experts = await topexpert.find();

  let months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  let currentMonth = new Date().toUTCString().slice(8, 11);
  let nextMonth = currentMonth; //temporary

  for (i = 0; i < months.length; i++) {
    if (currentMonth == months[i]) {
      nextMonth = months[i + 1];
    }
  }

  let currentMonthEvents = await session.find({
    month: currentMonth,
  });

  let nextMonthEvents = await session.find({
    month: nextMonth,
  });

  res.render("layout", {
    mainevent,
    experts,
    currentMonth,
    nextMonth,
    currentMonthEvents,
    nextMonthEvents,
  });
});

router.get("/reserve-seat", async function (req, res, next) {
  let sessions = await session.find();
  res.render("reserve-seat", {
    sessions,
    successMessage: "",
  });
});

router.post("/reserve-seat", async function (req, res, next) {
  let reservation = new booking(req.body);
  await reservation.save();

  let sessions = await session.find();
  res.render("reserve-seat", {
    sessions,
    successMessage: "Your seat has been booked sucessfully !!!!!  You will receive your confirmation email soon",
  });
});

router.get("/contact", function (req, res, next) {
  res.render("contact", {
    successMessage: "",
  });
});

router.post("/contact", async function (req, res, next) {
  let contactquery = new query(req.body);
  await contactquery.save();
  res.render("contact", {
    successMessage: "We have received your response and will contact you back soon",
  });
});

router.get("/about", function (req, res, next) {
  res.render("about");
});

router.get("/it-experts", async function (req, res, next) {
  let frontEnd = await itExpert.find({
    category: "front-end",
  });
  let backEnd = await itExpert.find({
    category: "back-end",
  });
  let logicBuilder = await itExpert.find({
    category: "logic-builder",
  });

  res.render("it-experts", {
    frontEnd,
    backEnd,
    logicBuilder,
  });
});

router.get("/online-education", async function (req, res, next) {
  let primary = await onlineEducator.find({
    category: "primary",
  });
  let elementary = await onlineEducator.find({
    category: "elementary",
  });
  let supplementary = await onlineEducator.find({
    category: "supplementary",
  });
  let intermediate = await onlineEducator.find({
    category: "intermediate",
  });

  res.render("online-education", {
    primary,
    elementary,
    supplementary,
    intermediate,
  });
});

router.get("/building-architecture", async function (req, res, next) {
  let residential = await buildingArchitect.find({
    category: "residential",
  });
  let commercial = await buildingArchitect.find({
    category: "commercial",
  });
  let interior = await buildingArchitect.find({
    category: "interior",
  });

  res.render("building-architecture", {
    residential,
    commercial,
    interior,
  });
});

router.get("/career-counselling", async function (req, res, next) {
  let careerbuilder = await careerCounseller.find({
    category: "career-builder",
  });
  let motivationalspeaker = await careerCounseller.find({
    category: "motivational-speaker",
  });

  res.render("career-counselling", {
    careerbuilder,
    motivationalspeaker,
  });
});

router.get("/login", function (req, res, next) {
  res.render("login");
});

router.get("/signup", function (req, res, next) {
  res.render("signup", {
    successMessage: "",
    errorMessage: "",
  });
});

router.post("/signup", uploadUserImage, async function (req, res, next) {
  let existinguser = await user.findOne({
    email: req.body.email,
  });

  if (existinguser)
    return res.render("signup", {
      successMessage: "",
      errorMessage: "User with this Email already exists",
    });

  let newuser = new user({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
  });

  let salt = await bcrypt.genSalt(10);
  newuser.password = await bcrypt.hash(req.body.password, salt);

  if (req.file) {
    newuser.image = req.file.filename;
  }

  await newuser.save();

  res.render("signup", {
    successMessage: "You have been successfully Registered with us !!!!!",
    errorMessage: "",
  });
});

router.get("/profile", async function (req, res, next) {
  let loggedInUser = null;

  if (res.locals.loginuser)
    loggedInUser = await user.findById(res.locals.loginuser._id);

  res.render("userprofile", {
    loggedInUser,
  });
});

router.post("/profile/:id", uploadUserImage, async function (req, res, next) {
  let updateduser = await user.findById(req.params.id);

  updateduser.name = req.body.name;
  updateduser.email = req.body.email;
  updateduser.phone = req.body.phone;

  if (req.body.password) {
    let salt = await bcrypt.genSalt(10);
    updateduser.password = await bcrypt.hash(req.body.password, salt);
  }

  if (req.file) updateduser.image = req.file.filename;

  await updateduser.save();

  let loggedInUser = await user.findById(req.params.id);
  return res.redirect("/");
});

router.get("/add-expert", checkAdmin, async function (req, res, next) {
  res.render("add-expert");
});

router.post("/add-expert", checkAdmin, uploadExpertImage, async function (req, res, next) {
  if (req.body.type == "IT-Expert") {
    var itexpert = await new itExpert();

    itexpert.name = req.body.name;
    itexpert.qualification = req.body.qualification;
    itexpert.specialization = req.body.expertee;
    itexpert.category = req.body.category;
    itexpert.contact = req.body.contact;

    if (req.file) {
      itexpert.image = req.file.filename;
    }

    itexpert.save();
  }

  if (req.body.type == "Online-Educator") {
    var onlineeducator = await new onlineEducator();

    onlineeducator.name = req.body.name;
    onlineeducator.qualification = req.body.qualification;
    onlineeducator.specialization = req.body.expertee;
    onlineeducator.category = req.body.category;
    onlineeducator.contact = req.body.contact;

    if (req.file) {
      onlineeducator.image = req.file.filename;
    }

    onlineeducator.save();
  }

  if (req.body.type == "Building-Architect") {
    var buildingarchitect = await new buildingArchitect();

    buildingarchitect.name = req.body.name;
    buildingarchitect.qualification = req.body.qualification;
    buildingarchitect.specialization = req.body.expertee;
    buildingarchitect.category = req.body.category;
    buildingarchitect.contact = req.body.contact;

    if (req.file) {
      buildingarchitect.image = req.file.filename;
    }

    buildingarchitect.save();
  }

  if (req.body.type == "Career-Counseller") {
    var careercounseller = await new careerCounseller();

    careercounseller.name = req.body.name;
    careercounseller.qualification = req.body.qualification;
    careercounseller.specialization = req.body.expertee;
    careercounseller.category = req.body.category;
    careercounseller.contact = req.body.contact;

    if (req.file) {
      careercounseller.image = req.file.filename;
    }

    careercounseller.save();
  }

  res.redirect("add-expert");
});

router.get("/add-session", checkAdmin, async function (req, res, next) {
  let itexperts = await itExpert.find();
  let onlineeducators = await onlineEducator.find();
  let buildingarchitects = await buildingArchitect.find();
  let careercounsellers = await careerCounseller.find();

  res.render("add-session", {
    itexperts,
    onlineeducators,
    buildingarchitects,
    careercounsellers,
  });
});

router.post("/add-session", checkAdmin, uploadSessionImage, async function (
  req,
  res,
  next
) {
  let newsession = new session();

  newsession.title = req.body.title;
  newsession.location = req.body.location;
  newsession.category = req.body.category;
  newsession.day = req.body.day;
  newsession.month = req.body.month;
  newsession.year = req.body.year;
  newsession.expert = req.body.expert;
  newsession.maplink = req.body.maplink;
  newsession.description = req.body.description;

  if (req.file) {
    newsession.image = req.file.filename;
  }

  newsession.save();

  res.redirect("add-session");
});

router.get("/sessions", async function (req, res, next) {
  
  if(req.cookies.sessionupdateid){
    if (req.cookies.sessionupdateid != "") {
      let tempsession = await session.findById(req.cookies.sessionupdateid);

      let updatedsessionid = req.cookies.sessionupdateid;
      let sessionupdateid = "";
      res.cookie("sessionupdateid", sessionupdateid);
      res.cookie("updatedsessionid", updatedsessionid);

      let itexperts = await itExpert.find();
      let onlineeducators = await onlineEducator.find();
      let buildingarchitects = await buildingArchitect.find();
      let careercounsellers = await careerCounseller.find();

      return res.render("update-session", {
        itexperts,
        onlineeducators,
        buildingarchitects,
        careercounsellers,
        tempsession,
      });
    }
  }

  let sessions = await session.find();
  console.log(sessions);
  res.render("sessions", {
    sessions,
  });
});

router.get("/all-experts", checkAdmin, async function (
  req,
  res,
  next
) {
  if (req.cookies.expertupdateid != "") {
    let updatedexpertid = req.cookies.expertupdateid;
    let expertupdateid = "";
    res.cookie("expertupdateid", expertupdateid);
    res.cookie("updatedexpertid", updatedexpertid);

    console.log(updatedexpertid);

    var expert = await itExpert.findById(updatedexpertid);
    if (expert) {
      return res.render("update-expert", {
        expert,
      });
    }
    expert = await buildingArchitect.findById(updatedexpertid);
    if (expert)
      return res.render("update-expert", {
        expert,
      });
    expert = await onlineEducator.findById(updatedexpertid);
    if (expert)
      return res.render("update-expert", {
        expert,
      });
    expert = await careerCounseller.findById(updatedexpertid);
    if (expert)
      return res.render("update-expert", {
        expert,
      });
  }

  let itExperts = await itExpert.find();
  let onlineEducators = await onlineEducator.find();
  let buildingArchitects = await buildingArchitect.find();
  let careerCounsellers = await careerCounseller.find();

  res.render("all-experts", {
    itExperts,
    onlineEducators,
    buildingArchitects,
    careerCounsellers,
  });
});

router.post("/all-experts", checkAdmin, uploadExpertImage, async function (req, res, next) {
  var expert = await itExpert.findByIdAndDelete(req.cookies.updatedexpertid);
  expert = await onlineEducator.findByIdAndDelete(req.cookies.updatedexpertid);
  expert = await buildingArchitect.findByIdAndDelete(
    req.cookies.updatedexpertid
  );
  expert = await careerCounseller.findByIdAndDelete(
    req.cookies.updatedexpertid
  );

  if (req.body.type == "IT-Expert") {
    var itexpert = new itExpert();

    itexpert.name = req.body.name;
    itexpert.qualification = req.body.qualification;
    itexpert.specialization = req.body.expertee;
    itexpert.category = req.body.category;
    itexpert.contact = req.body.contact;

    if (req.file) {
      itexpert.image = req.file.filename;
    }

    itexpert.save();
  }

  if (req.body.type == "Online-Educator") {
    var onlineeducator = new onlineEducator();

    onlineeducator.name = req.body.name;
    onlineeducator.qualification = req.body.qualification;
    onlineeducator.specialization = req.body.expertee;
    onlineeducator.category = req.body.category;
    onlineeducator.contact = req.body.contact;

    if (req.file) {
      onlineeducator.image = req.file.filename;
    }

    onlineeducator.save();
  }

  if (req.body.type == "Building-Architect") {
    var buildingarchitect = new buildingArchitect();

    buildingarchitect.name = req.body.name;
    buildingarchitect.qualification = req.body.qualification;
    buildingarchitect.specialization = req.body.expertee;
    buildingarchitect.category = req.body.category;
    buildingarchitect.contact = req.body.contact;

    if (req.file) {
      buildingarchitect.image = req.file.filename;
    }

    buildingarchitect.save();
  }

  if (req.body.type == "Career-Counseller") {
    var careercounseller = new careerCounseller();

    careercounseller.name = req.body.name;
    careercounseller.qualification = req.body.qualification;
    careercounseller.specialization = req.body.expertee;
    careercounseller.category = req.body.category;
    careercounseller.contact = req.body.contact;

    if (req.file) {
      careercounseller.image = req.file.filename;
    }

    careercounseller.save();
  }

  let updatedexpertid = "";
  res.cookie("updatedexpertid", updatedexpertid);
  return res.redirect("/");
});

router.get("/expert/update/:id", checkAdmin, function (req, res, next) {
  let expertupdateid = req.params.id;
  req.cookies.expertupdateid = expertupdateid;
  res.cookie("expertupdateid", expertupdateid);

  return res.redirect("/all-experts");
});

router.post("/login", sessionAuth, async function (req, res, next) {
  let loginuser = await user.findOne({
    email: req.body.email,
  });

  let isValid = await bcrypt.compare(req.body.password, loginuser.password);

  if (!isValid) return res.redirect("login");

  let token = jwt.sign({
      _id: loginuser._id,
      name: loginuser.name,
    },
    config.get("jwtPrivateKey")
  );

  req.header.loginToken = token;
  req.session.loginuser = loginuser;

  return res.redirect("/");
});

router.get("/signout", async function (req, res, next) {
  req.session.loginuser = null;
  let expertupdateid = "";
  let updatedexpertid = "";
  let sessionupdateid = "";
  let updatedsessionid = "";

  res.cookie("expertupdateid", expertupdateid);
  res.cookie("updatedexpertid", updatedexpertid);
  res.cookie("sessionupdateid", sessionupdateid);
  res.cookie("updatedsessionid", updatedsessionid);

  res.redirect("login");
});

//load session details
router.get("/:id", async function (req, res, next) {
  let sessions = await session.findById(req.params.id);
  res.render("session-details", {
    sessions,
  });
});

router.get("/session/delete/:id", checkAdmin, async function (req, res, next) {
  let tempsession = await session.findByIdAndDelete(req.params.id);
  return res.redirect("/sessions");
});

router.get("/expert/delete/:id", checkAdmin, async function (req, res, next) {
  let tempitexpert = await itExpert.findByIdAndDelete(req.params.id);
  let temponlineeducator = await onlineEducator.findByIdAndDelete(
    req.params.id
  );
  let tempbuildingarchitect = await buildingArchitect.findByIdAndDelete(
    req.params.id
  );
  let tempcareercounseller = await careerCounseller.findByIdAndDelete(
    req.params.id
  );

  return res.redirect("/all-experts");
});

router.get("/session/update/:id", checkAdmin, async function (req, res, next) {
  let sessionupdateid = req.params.id;
  req.cookies.sessionupdateid = sessionupdateid;
  res.cookie("sessionupdateid", sessionupdateid);
  return res.redirect("/sessions");
});

router.post("/sessions", checkAdmin, uploadSessionImage, async function (req, res, next) {
  let updatesession = await session.findById(req.cookies.updatedsessionid);

  let updatedsessionid = "";
  res.cookie("updatedsessionid", updatedsessionid);

  updatesession.title = req.body.title;
  updatesession.location = req.body.location;
  updatesession.category = req.body.category;
  updatesession.day = req.body.day;
  updatesession.month = req.body.month;
  updatesession.year = req.body.year;
  updatesession.expert = req.body.expert;
  updatesession.maplink = req.body.maplink;
  updatesession.description = req.body.description;

  if (req.file) {
    updatedsession.image = req.file.filename;
  }

  updatesession.save();

  return res.redirect("/");
});

router.post("/", async function (req, res, next) {
  let newsubscriber = new subscriber({
    email: req.body.email
  });

  newsubscriber.save();

  return res.redirect("/");
});

module.exports = router;