// import * as firebaseHelper from 'firebase-functions-helper'
import * as express from 'express'
import { db  } from './main'
const notificationModule = express()

// Add new notification
notificationModule.post('/', async (req, res) => {
    const adminCollection = db.collection('Admin')
    const notificationDocument=adminCollection.doc('Notification');
    const notification:Map<any,any>=new Map;
    notification.set('uid',req.body['token']);
    try {
        console.log(notification)
        const ans=await notificationDocument.set(notification,{merge:true})
        console.log(ans)
        res.status(201).send(`added a new notification token`)
    } catch (error) {
        console.log(error)
        res.status(400).send(`Error updating token!`)
    }
})

export { notificationModule }
