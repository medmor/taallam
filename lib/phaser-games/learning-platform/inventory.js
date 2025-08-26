export default class Inventory {
  constructor(scene) {
    this.scene = scene;
    this.items = []; // Array to store collected items
    this._onItemAdded = this._onItemAdded.bind(this);
    this._onItemRemoved = this._onItemRemoved.bind(this);
  }

  // Add an item to the inventory
  addItem(item) {
    this.items.push(item);
  }

  // Remove an item from the inventory
  removeItem(item) {
    const index = this.items.indexOf(item);
    if (index !== -1) {
      this.items.splice(index, 1);
    }
  }

  // Get all items in the inventory
  getItems() {
    return this.items;
  }

  // Placeholder for item added event handler
  _onItemAdded(item) {
    console.log(`Item added: ${item}`);
  }

  // Placeholder for item removed event handler
  _onItemRemoved(item) {
    console.log(`Item removed: ${item}`);
  }
}
