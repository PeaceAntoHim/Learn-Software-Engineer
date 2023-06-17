interface IBCAService {
   components(): void;
   logic(): void;
}

class BCAService implements IBCAService {
   // BCA: IBCAService
   components(): void {
      console.log("Components of BCA")
   }
   logic(): void {
      console.log("Logic of BCA")
   }
   
}

export {BCAService}