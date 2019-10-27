exports.getPosts = (_req, res) => {
  res.status(200).json({
    posts: [{
      _id: 1,
      title: 'Hello world',
      content: 'Content is overrated, fite me',
      imageURL: 'images/duck.jpg',
      creator: {
        name: 'Bananistan',
      },
      createdAt: new Date(),
    }],
  });
};

exports.createPost = (req, res) => {
  const { title, content } = req.body;
  // Create post in DB
  res.status(201).json({
    message: 'Post created successfully!',
    post: { id: new Date().toISOString(), title, content },
  });
};
