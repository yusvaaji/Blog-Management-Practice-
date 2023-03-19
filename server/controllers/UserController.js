const { User } = require("../models");
const { encryptPwd, decryptPwd } = require("../helpers/bcrypt");
const { tokenGenerator } = require("../helpers/jwt");
class UserController {
  

  static async getAllUsers(req, res) {
    //
    try {
      let users = await User.findAll();
      users = users.map((user) => {
        let decpass = "";
        decryptPwd(decpass, user.password);
        user.password = decpass;

        return user;
      });
      res.status(200).json(users);
    } catch (err) {
      res.status(500), json(err);
    }
  }
  static async getUserAccount(req, res) {
    //
    try {
      const id = +req.params.UserId;
      let userAccount = await User.findOne({
        where: { id },
      });

      if (userAccount) {
        res.status(200).json(userAccount);
      } else {
        res.status(404).json({
          message: "Id not found.",
        });
      }
    } catch (err) {
      res.status(500).json(err);
    }
  }
  static async register(req, res) {
    //
    try {
      const { username, email, image, password } = req.body;
      let result = await User.create({
        username,
        email,
        image,
        password: encryptPwd(password),
      });

      res.status(201).json(result);
    } catch (err) {
      res.status(500).json(err);
    }
  }
  static async login(req, res) {
    //
    try {
      const { email, password } = req.body;
      let userFound = await User.findOne({
        where: { email },
      });
      if (userFound) {
        if (decryptPwd(password, userFound.password)) {
          const access_token = tokenGenerator(userFound);
          res.status(200).json({
            access_token,
          });
        } else {
          res.status(403).json({
            message: "Wrong password",
          });
        }
        // if (password ==  userFound.password) {
        //   const access_token = tokenGenerator(userFound)
        //   res.status(200).json({
        //     access_token
        //   });
        // } else {
        //   res.status(403).json({
        //     message: "Wrong password"
        //   })
        // }
      } else {
        res.status(404).json({
          message: "Email not found.",
        });
      }
    } catch (err) {
      res.status(500).json(err);
    }
  }
  static async remove(req, res) {
    //
    try {
      const id = +req.params.UserId;
      let result = await User.destroy({
        where: { id },
      });
      if (result) {
        res.status(200).json({
          message: "User removed.",
        });
      } else {
        res.status(400).json({
          message: "User not deleted.",
        });
      }
    } catch (err) {
      res.status(500).json(err);
    }
  }
  static async edit(req, res) {
    //
    try {
      const id = +req.params.UserId;
      const { username, email, image, password } = req.body;

      let result = await User.update(
        {
          username,
          email,
          image,
          password,
        },
        {
          where: { id },
        }
      );

      if (result[0]) {
        res.status(200).json({
          message: "User updated.",
        });
      } else {
        res.status(400).json({
          message: "User not updated.",
        });
      }
    } catch (err) {
      res.status(500).json(err);
    }
  }
  static async getPostByUser(req, res) {
    //
  }
}

module.exports = UserController;
