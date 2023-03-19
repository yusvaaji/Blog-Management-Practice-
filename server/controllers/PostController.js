const { User,Post } = require("../models");
class PostController {
  static async getPost(req, res) {
    //
    try {
      let posts = await Post.findAll({
        include: [User],
      });

      res.status(200).json(posts);
    } catch (err) {
      res.status(500).json(err);
    }
  }
  static async getDetailsById(req, res) {
    //
    try {
      const id = Number(req.params.id);
      let post = await Post.findByPk(id);

      post
        ? res.status(200).json(product)
        : res.status(404).json({ message: "Post not found" });
    } catch (err) {
      res.status(500).json(err);
    }
  }
  static async store(req, res) {
    //
    try {
      const { title, body, author, search_vector, UserId } = req.body;

      let result = await Post.create({
        title,
        body,
        author,
        search_vector,
        UserId,
      });

      res.status(201).json(result);
    } catch (err) {
      res.status(500).json(err);
    }
  }
  static async destroy(req, res) {
    //
    try {
      const id = Number(req.params.id);
      let result = await Post.destroy({
        where: { id },
      });
      result
        ? res.status(200).json({ message: "Post deleted" })
        : res.status(400).json({ message: "Post not deleted" });
    } catch (err) {
      res.status(500).json(err);
    }
  }
  static async edit(req, res) {
    //
    try {
      const id = Number(req.params.id);
      const { title, body, author, search_vector, UserId } = req.body;

      let result = await Post.update(
        {
            title,
            body,
            author,
            search_vector,
            UserId,
        },
        {
          where: { id },
        }
      );

      result[0] === 1
        ? res.status(200).json({ message: "Post updated" })
        : res.status(400).json({ message: "Post not updated" });
    } catch (err) {
      res.status(500).json(err);
    }
  }
}
module.exports = PostController;
