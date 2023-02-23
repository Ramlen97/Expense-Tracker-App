const sequelize = require('../util/database');
const RazorpayServices = require('../services/razorpayservices');
const UserServices=require('../services/userservices');
const OrderServices = require('../services/orderservices');
const JwtServices=require('../services/jwtservices');

const getPremiumMembership = async (req, res) => {
    try {
        const amount = 2500;
        const order = await RazorpayServices.createOrder(amount);
        // console.log(order);

        await UserServices.createOrder(req.user,{ orderId: order.id, status: "PENDING" });
        res.status(201).json({ order, key_id: rzp.key_id });

    } catch (error) {
        console.log(error);
        res.status(403).json({ message: 'Something went wrong!', error: error });
    }
}

const postUpdateTransaction = async (req, res) => {
    try {
        const result = sequelize.transaction(async (t) => {
            const { status, order_id, payment_id } = req.body;
            const order = await OrderServices.getOrder({ where: { orderId: order_id } });
            if (status === "failed") {
                console.log('payment failed');
                return OrderServices.updateOrder(order,{ paymentId: payment_id, status: "FAILED" });
            }
            await Promise.all([
                OrderServices.updateOrder({ paymentId: payment_id, status: "SUCCESSFUL" },{transaction:t}),
                UserServices.updateUser(req.user,{ isPremiumUser: true },{transaction:t})
            ]);
            const { id, name, isPremiumUser } = req.user;
            res.status(202).json(({
                success: true, message: 'Transaction successful', token: JwtServices.generateToken(id, name, isPremiumUser)
            }));
        })


    } catch (error) {
        res.status(500).json({ message: 'Something went wrong!', error: error });
        console.log(error);
    }

}

module.exports={
    getPremiumMembership,
    postUpdateTransaction
}