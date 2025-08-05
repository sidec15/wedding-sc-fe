

export async function wait(millis: number){
  await new Promise((resolve) => setTimeout(resolve, millis));
}
