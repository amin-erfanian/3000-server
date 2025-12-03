const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    titleFa: {
      type: String,
      required: true,
    },
    titleEn: {
      type: String,
      default: '',
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    image: {
      type: String,
      default: '',
    },
    returnReasonAlert: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

// Index for faster parent lookups
categorySchema.index({ parent: 1 });

// Virtual for children
categorySchema.virtual('children', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent',
});

// Method to get full breadcrumb path (root → ... → current)
categorySchema.methods.getBreadcrumb = async function () {
  const breadcrumb = [this];
  let current = this;

  while (current.parent) {
    current = await mongoose.model('Category').findById(current.parent);
    if (current) {
      breadcrumb.unshift(current);
    } else {
      break;
    }
  }

  return breadcrumb;
};

// Static method to get category tree (for menus/navigation)
categorySchema.statics.getTree = async function (parentId = null) {
  const categories = await this.find({ parent: parentId, isActive: true }).lean();

  for (const category of categories) {
    category.children = await this.getTree(category._id);
  }

  return categories;
};

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
