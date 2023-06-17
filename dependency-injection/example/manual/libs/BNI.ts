interface IBNIService {
   components(): void;
   logic(): void;
}

class BNIService implements IBNIService {
   components(): void {
      console.log("Components of BNI")
   }
   logic(): void {
      console.log("Logic of BNI")
   }
   
   
}

export {BNIService}