interface IBRIService {
   components(): void;
   logic(): void;
}

class BRIService implements IBRIService {
   components(): void {
      // this.BCA("components")
      console.log("Components of BRI")
   }
   logic(): void {
      console.log("Logic of BRI")
   }
   
   
}

export {BRIService}