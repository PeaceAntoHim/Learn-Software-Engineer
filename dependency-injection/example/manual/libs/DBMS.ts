type Order = {
   id: number,
   menu: string,
}

interface Database {
   create(order: Order): void;
   update(order: Order): void;
 }
 
 
 class OrderService {
   database: Database;
 
   public create(order: Order): void {
     this.database.create(order);
   }
 
   public update(order: Order): void {
     this.database.update(order);
   }
 }
 
 
 class MySQLDatabase implements Database {
   public create(order: Order) {
     // create and insert to database
     order = {
      id: 1,
      menu: "KFC"
     }
   }
 
   public update(order: Order) {
     // update database
     order = {
      id: 1,
      menu: "AW"
     }
   }
 }


 console.log(new OrderService().create({ id: 1,
   menu: "AW"}))