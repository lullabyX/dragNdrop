// Autobind decorator
function Autobind(
  _: any,
  _2: string,
  descriptor: PropertyDescriptor
): PropertyDescriptor {
  const method = descriptor.value;

  return {
    configurable: true,
    enumerable: false,
    get() {
      return method.bind(this);
    },
  };
}

interface ValidateObj {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

// general validation function
function Validator(obj: ValidateObj) {
  let isValid = true;
  if (obj.required) {
    isValid = isValid && obj.value.toString().trim().length > 0;
  }
  if (obj.minLength && typeof obj.value === "string") {
    isValid = isValid && obj.value.length >= obj.minLength;
  }
  if (obj.maxLength && typeof obj.value === "string") {
    isValid = isValid && obj.value.length <= obj.maxLength;
  }
  if (obj.min && typeof obj.value === "number") {
    isValid = isValid && obj.value >= obj.min;
  }
  if (obj.max && typeof obj.value === "number") {
    isValid = isValid && obj.value >= obj.max;
  }
  return isValid;
}

// // Project List Class
// class ProjectList {
//   hostElement: HTMLDivElement;
//   projectListTemplateElement: HTMLTemplateElement;
//   element: HTMLElement;

//   constructor (private type: 'active' | 'finished') {
//     this.hostElement = document.getElementById('app') as HTMLDivElement;
//     this.projectListTemplateElement = document.getElementById('project-list') as HTMLTemplateElement;
//     const insertNode = document.importNode(this.projectListTemplateElement, true);

//     this.element = insertNode.firstElementChild as HTMLElement

//     this.attach()

//   }

//   private attach() {
//     this.hostElement.insertAdjacentElement('beforeend', this.element)
//   }
// }

// Project Input Class
class ProjectInput {
  hostElement: HTMLDivElement;
  projectInputTemplateElement: HTMLTemplateElement;
  element: HTMLFormElement;
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

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
    this.descriptionInputElement = this.element.querySelector(
      "#description"
    ) as HTMLInputElement;
    this.peopleInputElement = this.element.querySelector(
      "#people"
    ) as HTMLInputElement;

    this.configure();
    this.attach();
  }

  addProject() {
    const title = this.titleInputElement.value;
    const description = this.descriptionInputElement.value;
    const people = +this.peopleInputElement.value;

    const titleValidation: ValidateObj = {
      value: title,
      required: true,
      maxLength: 32,
    };
    const descriptionValidation: ValidateObj = {
      value: description,
      required: true,
      minLength: 5,
    };
    const peopleValidation: ValidateObj = {
      value: people,
      required: true,
      min: 1,
    };

    if (
      Validator(titleValidation) &&
      Validator(descriptionValidation) &&
      Validator(peopleValidation)
    ) {
      console.log(title, description, people);
    } else {
      alert("Validation Failed");
    }
  }

  @Autobind
  private submitHandler(event: Event) {
    event.preventDefault();
    this.addProject()
  }

  private configure() {
    this.element.addEventListener("submit", this.submitHandler);
  }

  private attach() {
    this.hostElement.insertAdjacentElement("afterbegin", this.element);
  }
}

const project = new ProjectInput();
