import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: { 
          type: String, 
          required: true 
        },
        quantity: { 
          type: Number, 
          required: true,
          min: 1
        },
        price: { 
          type: Number, 
          required: true,
          min: 0
        },
        image: {
          url: { 
            type: String, 
            required: true,
            default: "https://via.placeholder.com/150"
          },
          publicId: { 
            type: String,
            default: ""
          },
        },
        customization: {
          text: { 
            type: String,
            trim: true
          },
          image: {
            url: {
              type: String,
              trim: true
            },
            publicId: {
              type: String,
              trim: true
            },
          },
        },
      },
    ],
    
    amount: {
      type: Number,
      required: true,
      min: 0
    },

    address: {
      firstName: {
        type: String,
        required: true,
        trim: true
      },
      lastName: {
        type: String,
        trim: true
      },
      email: {
        type: String,
        trim: true,
        lowercase: true
      },
      phone: {
        type: String,
        required: true,
        trim: true
      },
      street: {
        type: String,
        required: true,
        trim: true
      },
      city: {
        type: String,
        required: true,
        trim: true
      },
      state: {
        type: String,
        trim: true
      },
      pincode: {
        type: String,
        trim: true
      },
      country: {
        type: String,
        default: "India",
        trim: true
      },
    },

    status: {
      type: String,
      enum: ["Order Placed", "Processing", "Shipped", "Out for Delivery", "Delivered", "Cancelled", "Returned"],
      default: "Order Placed"
    },

    paymentMethod: {
      type: String,
      enum: ["COD", "RAZORPAY", "STRIPE", "PAYPAL"],
      required: true,
      uppercase: true
    },

    payment: {
      type: Boolean,
      default: false,
    },

    razorpay_order_id: {
      type: String,
      trim: true
    },

    razorpay_payment_id: {
      type: String,
      trim: true
    },

    razorpay_signature: {
      type: String,
      trim: true
    },

    date: {
      type: Number,
      default: Date.now,
    },

    estimatedDelivery: {
      type: Date
    },

    trackingNumber: {
      type: String,
      trim: true
    },

    notes: {
      type: String,
      trim: true
    },

    cancelReason: {
      type: String,
      trim: true
    },

    refundAmount: {
      type: Number,
      min: 0
    },

    refundStatus: {
      type: String,
      enum: ["None", "Pending", "Processing", "Completed", "Failed"],
      default: "None"
    }
  },
  { 
    timestamps: true,
    indexes: [
      { userId: 1, createdAt: -1 },
      { status: 1 },
      { paymentMethod: 1 },
      { "items.productId": 1 }
    ]
  }
);

orderSchema.pre('save', function(next) {
  if (this.isNew && !this.estimatedDelivery) {
   
    const deliveryDays = this.paymentMethod === 'COD' ? 7 : 5;
    this.estimatedDelivery = new Date(Date.now() + deliveryDays * 24 * 60 * 60 * 1000);
  }
  next();
});

orderSchema.methods.canBeCancelled = function() {
  return ['Order Placed', 'Processing'].includes(this.status);
};

orderSchema.methods.canBeReturned = function() {
  return this.status === 'Delivered' && 
         (Date.now() - this.updatedAt.getTime()) <= (7 * 24 * 60 * 60 * 1000); // 7 days
};


orderSchema.statics.getOrdersByStatus = function(status) {
  return this.find({ status }).populate('userId', 'firstName lastName email');
};

orderSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});


orderSchema.virtual('formattedDate').get(function() {
  return new Date(this.date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

const Order = mongoose.model("Order", orderSchema);
export default Order;