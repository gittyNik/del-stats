# Contributing

## API Guidelines

Every Success API should return data with the following fields:

```javascript
res.status(201).json({
              message: 'Breakout and sandbox created',
              data,
              type: 'success',
            });
```

* Appropriate Status code
* Message
* Data
* type - success/failure

Every Failure API should return data with the following fields:

```javascript
res.status(500).json({
          message: `Reason for error: ${err}`,
          type: 'failure',
        });
```

* Appropriate Status code
* Message - Send either the error or specific text that can help identify error.
* type - success/failure

### MODEL Guidlines

Every model that you create should have CRUD Operations
And should have controllers and routes for the same
All CRUD Operations such be created only in the model file
This will help us to create Content management systems quickly for the same

Every model should have the following fields

```javascript
id - defaultValue: Sequelize.UUIDV4,
created_at - No Default
updated_at - Default: NOW()
updated_by - Should populate the user id creating or updating
```

### ROLES

Every Route should have restricted access
Set specific roles when creating routes like below:

```javascript
import { USER_ROLES } from '../../models/user';

const {
  ADMIN, OPERATIONS,
} = USER_ROLES;

// Restrict modifications by Role
router.use(allowMultipleRoles([ADMIN, OPERATIONS]));
```

List of roles are:

* LEARNER
* EDUCATOR
* ENABLER
* CATALYST
* ADMIN
* GUEST
* SUPERADMIN
* REVIEWER

By default, SUPERADMIN has access to all routes

### MIGRATIONS

Create your migration file using the below command:

``` javascript
sequelize migration:generate --name my-migration-name
```

This will create a migration file in the folder db/migrations
See previous migrations as reference and use those to create a migration

Create migrations should be preceeded by the name - create
update by - update
remove by - remove
add by - add

Sequelize doesn't not have a direct way to update enums,
use the same way as used in one of the migrations to update enums

### SEEDERS

Create seed data so that we can test every api with dummy data

```
sequelize seed:create --name my-seed-name
```

## NOTES

When contributing to this repository, please first discuss the change you wish to make via issue,
email, or any other method with the owners of this repository before making a change.

Please note we have a code of conduct, please follow it in all your interactions with the project.

## Pull Request Process

1. Ensure any install or build dependencies are removed before the end of the layer when doing a 
   build.
2. Update the .env.sample with details of changes to the interface, this includes new environment 
   variables, exposed ports, useful file locations and container parameters.
3. Increase the version numbers in any examples files and the README.md to the new version that this
   Pull Request would represent.
4. You may merge the Pull Request in once you have the sign-off of two other developers, or if you 
   do not have permission to do that, you may request the second reviewer to merge it for you.

## Code of Conduct

### Our Pledge

In the interest of fostering an open and welcoming environment, we as
contributors and maintainers pledge to making participation in our project and
our team a harassment-free experience for everyone, regardless of age, body
size, disability, ethnicity, gender identity and expression, level of experience,
nationality, personal appearance, race, religion, or sexual identity and
orientation.

### Our Standards

Examples of behavior that contributes to creating a positive environment
include:

* Using welcoming and inclusive language
* Being respectful of differing viewpoints and experiences
* Gracefully accepting constructive criticism
* Focusing on what is best for the team
* Showing empathy towards other team members