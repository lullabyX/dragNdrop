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

// Project type
enum ProjectType {
  ACTIVE,
  FINISHED,
}

// Drag & Drop interface
interface Dragable {
  dragStart(event: DragEvent): void;
  dragEnd(event: DragEvent): void;
}

interface DragTarget {
  dragOver(event: DragEvent): void;
  dragLeave(event: DragEvent): void;
  drop(event: DragEvent): void;
}

// Content Class
abstract class Content<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement;
  hostElement: T;
  element: U;

  constructor(
    hostId: string,
    templateId: string,
    addAfterBegin: boolean,
    elementId?: string
  ) {
    this.templateElement = document.getElementById(
      templateId
    ) as HTMLTemplateElement;
    this.hostElement = document.getElementById(hostId) as T;

    const insertNode = document.importNode(this.templateElement.content, true);
    this.element = insertNode.firstElementChild as U;
    if (elementId) {
      this.element.setAttribute("id", elementId);
    }

    this.attach(addAfterBegin);
  }

  abstract configure(): void;
  abstract renderContents(): void;

  private attach(addAfterBegin: boolean) {
    this.hostElement.insertAdjacentElement(
      addAfterBegin ? "afterbegin" : "beforeend",
      this.element
    );
  }
}

// Project Class
class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public type: ProjectType
  ) {}
}

type ListenerFn<T> = (items: T[]) => void;

abstract class State<T> {
  protected listeners: ListenerFn<T>[] = [];

  addListeners(listener: ListenerFn<T>) {
    this.listeners.push(listener);
  }

  abstract callListener(items?: any): void;
}

// Project State Class
class ProjectState extends State<Project> {
  private projectList: Project[] = [];
  static instance: ProjectState;

  private constructor() {
    super();
  }

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }

  callListener(project: Project) {
    this.projectList.push(project);
    this.updateListeners();
  }

  addListener(listener: ListenerFn<Project>) {
    this.listeners.push(listener);
  }

  updateListeners() {
    for (const listener of this.listeners) {
      listener(this.projectList.slice());
    }
  }

  moveProject(projectId: string, type: ProjectType) {
    const prj = this.projectList.find((project) => project.id === projectId);
    if (prj && prj.type !== type) {
      prj.type = type;
      this.updateListeners();
    }
  }
}

const projectState = ProjectState.getInstance();

class ProjectItem
  extends Content<HTMLUListElement, HTMLLIElement>
  implements Dragable
{
  get person() {
    if (this.project.people === 1) {
      return "1 person";
    }
    return `${this.project.people} persons`;
  }

  constructor(ulId: string, private project: Project) {
    super(ulId, "single-project", false, project.id);
    this.renderContents();
    this.configure();
  }

  @Autobind
  dragStart(event: DragEvent): void {
    event.dataTransfer!.setData("text/plain", this.project.id);
    event.dataTransfer!.dropEffect = 'move'
  }

  @Autobind
  dragEnd(event: DragEvent): void {
    console.log(event);
  }

  renderContents(): void {
    this.element.querySelector("h2")!.textContent = this.project.title;
    this.element.querySelector("h3")!.textContent = this.person + " assigned";
    this.element.querySelector("p")!.textContent = this.project.description;
  }

  configure(): void {
    this.element.addEventListener("dragstart", this.dragStart);
    this.element.addEventListener("dragend", this.dragEnd);
  }
}

// Project List Class
class ProjectList
  extends Content<HTMLDivElement, HTMLElement>
  implements DragTarget
{
  receivedList: Project[] = [];

  constructor(private type: "active" | "finished") {
    super("app", "project-list", false, `${type}-projects`);

    this.renderContents();
    this.configure();
  }

  @Autobind
  dragOver(event: DragEvent): void {
    event?.preventDefault();
    if (event.dataTransfer && event.dataTransfer.types[0]=== "text/plain") {
      const listEl = this.element.querySelector('ul')!;
      listEl.classList.add("droppable");
    }
  }

  @Autobind
  dragLeave(event: DragEvent): void {
    console.log(event);
    
    const listEl = this.element.querySelector('ul')!;
    listEl.classList.remove("droppable");
  }

  @Autobind
  drop(event: DragEvent): void {
    const prjId = event.dataTransfer?.getData("text/plain")!;

    projectState.moveProject(
      prjId,
      this.type === "active" ? ProjectType.ACTIVE : ProjectType.FINISHED
    );
  }

  configure(): void {
    projectState.addListener(this.renderList);
    this.element.addEventListener("dragover", this.dragOver);
    this.element.addEventListener("dragleave", this.dragLeave);
    this.element.addEventListener("drop", this.drop);
  }

  renderContents() {
    const listId = `${this.type}-project-list`;
    this.element.querySelector("ul")!.id = listId;
    this.element.querySelector(
      "h2"
    )!.textContent = `${this.type.toUpperCase()} PROJECTS`;
  }

  @Autobind
  private renderList(projects: Project[]) {
    const listEl = document.getElementById(
      `${this.type}-project-list`
    ) as HTMLUListElement;
    listEl.innerHTML = "";

    for (const project of projects) {
      if (this.type === "active" && project.type === ProjectType.ACTIVE) {
        new ProjectItem(listEl.id, project);
      }

      if (this.type === "finished" && project.type === ProjectType.FINISHED) {
        new ProjectItem(listEl.id, project);
      }
    }
  }
}

// Project Input Class
class ProjectInput extends Content<HTMLDivElement, HTMLFormElement> {
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    super("app", "project-input", true, "user-input");

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
    this.renderContents();
  }

  configure() {
    this.element.addEventListener("submit", this.submitHandler);
  }

  renderContents(): void {}

  private gatherUserInput() {
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
      const project = new Project(
        Math.random().toString(),
        title,
        description,
        people,
        ProjectType.ACTIVE
      );
      projectState.callListener(project);
    } else {
      alert("Validation Failed");
    }
  }

  @Autobind
  private submitHandler(event: Event) {
    event.preventDefault();
    this.gatherUserInput();
  }
}

const project = new ProjectInput();

const activePrjList = new ProjectList("active");
const finishedPrjList = new ProjectList("finished");
