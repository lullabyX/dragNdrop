class Project {
  hostElement: HTMLDivElement;
  projectInputTemplateElement: HTMLTemplateElement;
  element: HTMLFormElement;

  constructor() {
    this.hostElement = document.getElementById("app") as HTMLDivElement;
    this.projectInputTemplateElement = document.getElementById(
      "project-input"
    ) as HTMLTemplateElement;

    const insertedNode = document.importNode(this.projectInputTemplateElement.content, true);
    this.element = insertedNode.firstElementChild as HTMLFormElement

    this.attach()
  }

  private attach() {
    this.hostElement.insertAdjacentElement('afterbegin', this.element);
  }
}

const project = new Project();