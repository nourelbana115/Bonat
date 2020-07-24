const bodyParser = require('body-parser');
const express = require('express');
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);
const _ = require('lodash');
const { DashboardUser } = require('../db/models/DashboardUsers');
const { Merchant } = require('../db/models/merchant');

let app = express();
app.use(bodyParser.json());

exports.updateMerchant = (req, res) => {
  updateData({ idMerchant: req.body.idMerchant, token: req.body.token })
    .then(response => {
      res.send(response)
    })
    .catch(err => {
      res.status(400).send(err);
    })
}

exports.checkUser = async (req, res, next) => {
  try {
    const idUser = req.header('access_id');
    const user = await DashboardUser.findOne({ access_id: idUser })
    if (!bcrypt.compareSync(req.header('secret'), user.secret) || user.status !== 'active') {
      res.status(401).send();
    } else {
      next();
    }
  } catch (err) {
    res.status(401).send();
  }
}

const updateData = async ({ idMerchant, token }) => {
  try {
    const foundMerchant = await Merchant.updateOne({ idMerchant: idMerchant }, { token: token })
    return foundMerchant
  } catch (err) {
    res.status(400).send();
  }
}

exports.createUser = (req, res) => {
  let body = _.pick(req.body, ['secret', 'status', 'access_id']);
  let data = {
    secret: bcrypt.hashSync(body.secret, salt),
    status: body.status,
    access_id: body.access_id
  }
  let newUser = new DashboardUser(data)
  newUser.save()
    .then(() => {
      return res.send({ newUser });
    })
    .catch(err => {
      res.send(err);
    });
}