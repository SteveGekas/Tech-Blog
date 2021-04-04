const router = require('express').Router();
const { User, Post, Comment } = require('../../models');
const withAuth = require('../../utils/auth');

router.get('/', (req, res) => {
    Post.findAll({

        attributes: [
            'id',
            'post_text',
            'title',
            'created_at',
          ],
        order: [[ 'created_at', 'DESC']],
        include: [
            {
                model: User,
                attributes: ['username']
            },
            {
                model: Comment,
                attributes: ['id', 'comment_text', 'post_id', 'user_id', 'created_at'],
                include: {
                    model: User,
                    attributes: ['username']
                }
            }
        ]
    })

    .then(dbPosts => res.json(dbPosts))

    .catch(err => {
        console.log(err);
        res.status(500).json(err);
    });
});

router.get('/:id', (req, res) => {
    Post.findOne({
      where: {
        id: req.params.id
      },

      attributes: [
        'id',
        'post_text',
        'title',
        'created_at',
      ],

      include: [
        {
          model: User,
          attributes: ['username']
        },

        {
            model: Comment,
            attributes: ['id', 'comment_text', 'post_id', 'user_id', 'created_at'],
            include: {
                model: User,
                attributes: ['username']
            }
        }
      ]
    })
      .then(dbPosts => {

        if (!dbPosts) {
          res.status(404).json({ message: 'There is no post with this id' });
          return;
        }
        res.json(dbPosts);
      })
      .catch(err => {

        console.log(err);
        res.status(500).json(err);
      });
  });


router.post('/', withAuth, (req, res) => {

    Post.create({
        title: req.body.title,
        post_text: req.body.post_text,
        user_id: req.session.user_id
    })

    .then(dbPosts => res.json(dbPosts))
    .catch(err => {
        console.log(err);
        res.status(500).json(err);
    });
});

router.put('/:id', withAuth, (req, res) => {
    Post.update(req.body,
        {
            where: {
                id: req.params.id
            }
        }
    )
    .then(dbPosts => {
        if (!dbPosts) {
            res.status(404).json({ message: 'There is no post with this id' });
            return;
        }
        res.json(dbPosts);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json(err)
    });
});

router.delete('/:id', withAuth, (req, res) => {
    Post.destroy({
      where: {
        id: req.params.id
      }
    })
      .then(dbPosts => {
        if (!dbPosts) {
          res.status(404).json({ message: 'There is no post with this id' });
          return;
        }
        res.json(dbPosts);
      })
      .catch(err => {
        console.log(err);
        res.status(500).json(err);
      });
  });

module.exports = router;