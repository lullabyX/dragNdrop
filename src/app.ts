function Autobind(_: any, _2: string, descriptor: PropertyDescriptor): PropertyDescriptor {
  const method = descriptor.value;
  
  return {
    configurable: true,
    enumerable: false,
    get() {
      return method.bind(this);
    }
  }
}
class Project {
  hostElement: HTMLDivElement;
  projectInputTemplateElement: HTMLTemplateElement;
  element: HTMLFormElement;
  titleInputElement: HTMLInputElement;
  descriptionInputeElement: HTMLInputElement;
  peopleInputeElement: HTMLInputElement;

  constructor() {
    this.hostElement = document.getElementById("app") as HTMLDivElement;
    this.projectInputTemplateElement = document.getElementById(
      "project-input"
    ) as HTMLTemplateElement;

    const insertedNode = document.importNode(
      this.projectInputTemplateElement.content,
      true
    );
    this.element = insertedNode.firstElementChild as HTMLFormElement;
    this.element.setAttribute("id", "user-input");

    this.titleInputElement = this.element.querySelector(
      "#title"
    ) as HTMLInputElement;
    this.descriptionInputeElement = this.element.querySelector(
      "#description"
    ) as HTMLInputElement;
    this.peopleInputeElement = this.element.querySelector(
      "#people"
    ) as HTMLInputElement;

    this.configure();
    this.attach();
  }

  @Autobind
  private submitHandler(event: Event) {
    event.preventDefault();
    console.log(this.titleInputElement.value);
  }

  private configure() {
    this.element.addEventListener("submit", this.submitHandler);
  }

  private attach() {
    this.hostElement.insertAdjacentElement("afterbegin", this.element);
  }
}

const project = new Project();
