import readline from 'readline';
import {config} from './config/config';


type keyServices = keyof typeof config

function getInputFromCommandLine(prompt: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise<string>((resolve) => {
    rl.question(prompt, (input) => {
      rl.close();
      resolve(input);
    });
  });
}

async function getServiceName() : Promise<string>{
  const keyOfObj = Object.keys(config)
  let name = await getInputFromCommandLine('Pick one of this service: \n 1. BCA \n 2. BNI \n 3. BRI \n 4. SEA \n\n') as string;
  console.log(name.toUpperCase())
  
  while(!keyOfObj.includes(name)) {
    name = await getInputFromCommandLine('\n\nService you pick undefind please select the right one: \n 1. BCA \n 2. BNI \n 3. BRI \n 4. SEA \n\n') as string
    console.log(name.toUpperCase())

  }
  return name
}


// Define an interface for the service
interface UserService {
   getUserById(id: string): Promise<string>;
 }
 
 // Define a class that implements the service
class UserServiceImpl implements UserService {
  async getUserById(id: string): Promise<string> {
     // ...implementation details here...
    
    return id
   }
 }
 
 // Define a class that depends on the service
 class UserController {
   private readonly userService: UserService;
 
   constructor(userService: UserService) {
     this.userService = userService;
   }
 
   async getUserById(id: string): Promise<string> {
     return this.userService.getUserById(id);
   }
 }

 
 // Create an instance of the service
 const userService = new UserServiceImpl();
 
 // Create an instance of the controller and pass in the service as a dependency
 const userController = new UserController(userService);
 // Use the controller to get a user by ID
 const user = async () => {
  const data = await userController.getUserById(await getServiceName())
  const init = config[data as keyServices].service
  init.components()
  init.logic
}
 user()

