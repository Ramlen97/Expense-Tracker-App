const Razorpay = require('razorpay');
const Order = require('../models/order');

exports.getPremiumMembership = async (req, res) => {
    try {
        const rzp = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        })

        const amount = 2500;
        const order = await rzp.orders.create({ amount, currency: "INR" });
        // console.log(order);

        await req.user.createOrder({ orderId: order.id, status: "PENDING" });
        res.status(201).json({ order, key_id: rzp.key_id });

    } catch (error) {
        console.log(error);
        res.status(403).json({ message: 'Something went wrong', error: error });
    }
}

exports.postUpdateTransaction = async(req, res) => {
    try {
        // console.log(req.body);
        const order = await Order.findOne({ where: { orderId: req.body.order_id }});
        const promise1= order.update({paymentId:req.body.payment_id,status:"SUCCESSFUL"});
        const promise2=req.user.update({isPremiumUser:true});

        await Promise.all([promise1,promise2]);
        res.status(202).json(({success:true,message:'Transaction successful'}));

    } catch (error) {
        console.log(error);
    }

}