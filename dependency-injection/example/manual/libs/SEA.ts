interface ISEAService {
   components(): void;
   logic(): void;
}

class SEAService implements ISEAService {
   components(): void {
      // this.BCA("components")
      console.log("Components of SEA")
   }
   logic(): void {
      console.log("Logic of SEA")
   }
   
}

export {SEAService}