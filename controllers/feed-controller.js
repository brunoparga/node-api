exports.getPosts = (_req, res) => {
  res.status(200).json({
    posts: [{ title: 'Hello world', content: 'Content is overrated, fite me' }],
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
