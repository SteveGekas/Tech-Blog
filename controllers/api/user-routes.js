const router = require('express').Router();
const { User, Post, Comment } = require('../../models');
const withAuth = require('../../utils/auth');

router.get('/', (req, res) => {

    User.findAll({

        attributes: { exclude: ['password'] }
    })

        .then(dbUsers => res.json(dbUsers))
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        });
});

router.get('/:id', (req, res) => {

    User.findOne({

        attributes: { exclude: ['password'] },
        where: {
            id: req.params.id
        },

        include: [
            {
                model: Post,
                attributes: ['id', 'title', 'post_text', 'created_at']
            },

            {
                model: Comment,
                attributes: ['id', 'comment_text', 'post_id', 'user_id', 'created_at'],
                include: {
                    model: Post,
                    attributes: ['title']
                }
            }
        ]
    })
        .then(dbUsers => {
            if (!dbUsers) {
                res.status(404).json({ message: 'There is no user with this id' });
                return;
            }
            res.json(dbUsers);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        });
});

router.post('/', (req, res) => {

    User.create({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
    })
        .then(dbUsers => {
            req.session.save(() => {
                req.session.user_id = dbUsers.id;
                req.session.username = dbUsers.username;
                req.session.loggedIn = true;

                res.json(dbUsers);
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        });
});

router.post('/login', (req, res) => {

    User.findOne({
        where: {
            email: req.body.email
        }
    }).then(dbUsers => {

        if (!dbUsers) {
            res.status(400).json({ message: 'There is ni user with that email address' });
            return;
        }

        const validPassword = dbUsers.checkPassword(req.body.password);

        if (!validPassword) {
            res.status(400).json({ message: 'Incorrect password!' });
            return;
        }

        req.session.save(() => {
            req.session.user_id = dbUsers.id;
            req.session.username = dbUsers.username;
            req.session.loggedIn = true;

            res.json({ user: dbUsers, message: 'Log in successful!' });
        });
    });
});

router.post('/logout', withAuth, (req, res) => {
    if (req.session.loggedIn) {
        req.session.destroy(() => {
            
            res.status(204).end();
        });
    } else {
        
        res.status(404).end();
    }
})

router.put('/:id', withAuth, (req, res) => {
    
    User.update(req.body, {
        individualHooks: true,
        where: {
            id: req.params.id
        }
    })
        .then(dbUsers => {
            if (!dbUsers[0]) {
                res.status(404).json({ message: 'There is no user with this id' });
                return;
            }
            res.json(dbUsers);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        });
})

router.delete('/:id', withAuth, (req, res) => {

    User.destroy({
        where: {
            id: req.params.id
        }
    })
        .then(dbUsers => {
            if (!dbUsers) {
                res.status(404).json({ message: 'There is no user with this id' });
                return;
            }
            res.json(dbUsers);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        });
});

module.exports = router;