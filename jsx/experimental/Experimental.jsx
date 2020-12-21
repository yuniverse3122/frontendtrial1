const ImagePanel = require('./ImagePanel.jsx');

class Experimental extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      position: { x: 0, y: 0, timeout: null },
      images: [],
      rp: [],
      imageNumber: -1,
      zoomReady: true,
      pointers: [],
      zoomScale: 1,
      stopZooming: false,
      mouseOverImage: false,
      gridSize: 50,
      pixelScale: { x: 1, y: 1 },
      menuRemovalTimeout: null,
      rows: 0,
      columns: 0,
      labels: [],
    };
    this.render = this.render.bind(this);
    this.loadFile = this.loadFile.bind(this);
    this.toggleSelected = this.toggleSelected.bind(this);
    this.zoomIn = this.zoomIn.bind(this);
    this.runAI = this.runAI.bind(this);

    window.addEventListener(
      'wheel',
      (e) => {
        if (this.state.mouseOverImage && e.ctrlKey) {
          e.preventDefault();
          if (
            this.state.images.length > 0 &&
            (e.deltaY >= 0 || !this.state.stopZooming)
          ) {
            let zoomScale = this.state.zoomScale;
            zoomScale = Math.max(0, zoomScale - e.deltaY * 0.025);
            this.setState({ zoomScale });
            this.zoomIn()(e);
          }
        }
      },
      { passive: false }
    );
  }

  toggleClass(target, className) {
    target.classList.contains(className)
      ? target.classList.remove(className)
      : target.classList.add(className);
  }

  GUI() {
    return (
      <div className="hero is-fullheight is-black">
        <div className="columns has-panels">
          {/* <div className="column is-2 is-root">{this.projectColumn()}</div>
          <div className="column is-3 is-root">{this.evalColumn()}</div>
          <div className="column is-7 is-root">
            <ImagePanel parent={this} />
          </div> */}
          <div className="column is-6 is-root">
            <ImagePanel parent={this} />
            <div className="box has-background-black is-navigation-panel">
              <div className="columns has-subpanels is-marginless">
                <div className="column is-12 is-child">{this.evalColumn()}</div>
              </div>
            </div>
          </div>
          <div className="column is-2 is-root">
            <div className="box has-background-black is-panel">
              <div className="columns has-subpanels">
                <div className="column is-12 is-child has-padding">
                  <div className="box has-background-dark is-subpanel is-flex is-stacked">
                    {this.titleBox('ZOOM-IN (INTENSITY)')}
                    <div className="box is-input-panel is-flex-fill is-small">
                      <div className="box is-fullsize">
                        <img id="zoomInImage" />
                      </div>
                    </div>
                    {this.titleBox('IMAGE EDITING')}
                    {/* {this.subTitleBox('GPS Coordinates (latitude/longitude)')} */}
                    <div className="box is-input-panel is-flex-fill is-flex is-stacked">
                      {/* <div className="columns is-flex-fill">
                        <div className="column is-6 is-flex is-stacked is-child">
                          <div className="box is-input-panel is-flex-fill"></div>
                          <div className="box is-input-panel is-flex-fill"></div>
                        </div>
                        <div className="column is-6 is-flex is-stacked is-child">
                          <div className="box is-input-panel is-flex-fill"></div>
                          <div className="box is-input-panel is-flex-fill"></div>
                        </div>
                      </div> */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="column is-4 is-root">{this.projectColumn()}</div>
        </div>
      </div>
    );
  }

  zoomIn(drawBox = true) {
    return (e) => {
      if (!drawBox) {
        this.setState({ mouseOverImage: false });
      }
      if (this.state.zoomReady || !drawBox) {
        const images = this.state.images;
        if (images.length > 0) {
          const zoomSize = {
            width: Math.max(1, 80 * this.state.zoomScale),
            height: Math.max(1, 80 * this.state.zoomScale),
          };
          this.setState({ zoomReady: false });
          const {
            canvas,
            zoomInCanvas,
            imageCopy,
            position,
            image,
            zoomInImage,
          } = this.fetchImageInformation(e, zoomSize);
          const ctx = canvas.getContext('2d');
          const zoomCtx = zoomInCanvas.getContext('2d');
          if (drawBox) {
            this.drawZoomInData(imageCopy, position, zoomSize, ctx, zoomCtx);
          }
          canvas.convertToBlob().then((blob) => {
            image.onload = () => {
              zoomInCanvas.convertToBlob().then((zoomBlob) => {
                zoomInImage.onload = () => {
                  this.setState({ position, zoomReady: true });
                };
                zoomInImage.src = window.URL.createObjectURL(zoomBlob);
              });
            };
            image.src = window.URL.createObjectURL(blob);
          });
        }
      }
    };
  }

  fetchImageInformation(e, zoomSize) {
    const image = e.target;
    const zoomInImage = document.getElementById('zoomInImage');
    const rect = image.getBoundingClientRect();
    const position = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    const imageCopy = document.getElementById('mainImage');
    const canvas = new OffscreenCanvas(imageCopy.width, imageCopy.height);
    const zoomInCanvas = new OffscreenCanvas(zoomSize.width, zoomSize.height);
    return { canvas, zoomInCanvas, imageCopy, position, image, zoomInImage };
  }

  drawZoomInData(imageCopy, position, zoomSize, ctx, zoomCtx) {
    const gridScale = {
      x: imageCopy.naturalWidth / imageCopy.width,
      y: imageCopy.naturalHeight / imageCopy.height,
    };
    const pixelScale = { x: 1 / gridScale.x, y: 1 / gridScale.y };
    if (
      zoomSize.width < imageCopy.width ||
      zoomSize.height < imageCopy.height
    ) {
      this.setState({ stopZooming: false, pixelScale });
    } else {
      this.setState({ stopZooming: true, pixelScale });
    }
    const box = {
      left: position.x - zoomSize.width / 2,
      top: position.y - zoomSize.height / 2,
      width: zoomSize.width * gridScale.x,
      height: zoomSize.height * gridScale.y,
    };
    ctx.strokeStyle = 'magenta';
    ctx.strokeRect(box.left, box.top, zoomSize.width, zoomSize.height);
    zoomCtx.drawImage(
      imageCopy,
      box.left * gridScale.x,
      box.top * gridScale.y,
      box.width,
      box.height,
      0,
      0,
      zoomSize.width,
      zoomSize.height
    );
  }

  evalColumn() {
    const handleButton = (buttonName) => {
      switch (buttonName) {
        case 'grid':
          this.toggleClass(document.getElementById('grid'), 'is-visible');
          break;
        case 'mouseDock':
          this.toggleClass(
            document.getElementById('zoomInOverlay'),
            'has-no-pointer'
          );
          break;
      }
    };
    const toggleBtn = (e) => {
      this.toggleClass(e.target, 'is-active');
      handleButton(e.target.name);
    };
    return (
      <div className="box has-background-dark is-subpanel is-flex is-stacked">
        {/* {this.titleBox('SECTION EVALUATION')}
          <div className="box is-input-panel is-flex-compact">
            <div className="box is-section-eval-info">Image Name: </div>
            <div className="box is-section-eval-info">Pavement Type:</div>
            <div className="box is-section-eval-info is-main">PCI Rating:</div>
          </div>
          <div className="box is-input-panel is-flex-fill"></div>
          <div className="box is-input-panel is-flex-fill"></div> */}
        {this.titleBox('IMAGE NAVIGATION')}
        <div className="box is-flex-fill is-fixed-flex-height">
          <div className="columns is-marginless">
            <div className="column is-4 is-subpanel is-flex is-stacked  ">
              <div className="box is-input-panel is-flex-compact">
                <div className="box is-flex">
                  <div
                    className="box is-flex-fill has-text-centered is-electric"
                    onClick={this.toggleSelected(0)}
                  >
                    First
                  </div>
                  <div
                    className="box is-flex-fill has-text-centered is-electric"
                    onClick={this.toggleSelected(
                      Math.max(0, this.state.imageNumber - 10)
                    )}
                  >
                    <i className="fas fa-fast-backward" aria-hidden="true"></i>
                  </div>
                  <div
                    className="box is-flex-fill has-text-centered is-electric"
                    onClick={this.toggleSelected(
                      Math.max(0, this.state.imageNumber - 1)
                    )}
                  >
                    <i className="fas fa-step-backward" aria-hidden="true"></i>
                  </div>
                  <div className="box is-flex-fill has-text-centered is-electric">
                    <i className="fas fa-play" aria-hidden="true"></i>
                  </div>
                  <div
                    className="box is-flex-fill has-text-centered is-electric"
                    onClick={this.toggleSelected(
                      Math.min(
                        this.state.images.length - 1,
                        this.state.imageNumber + 1
                      )
                    )}
                  >
                    <i className="fas fa-step-forward" aria-hidden="true"></i>
                  </div>
                  <div
                    className="box is-flex-fill has-text-centered is-electric"
                    onClick={this.toggleSelected(
                      Math.min(
                        this.state.images.length - 1,
                        this.state.imageNumber + 10
                      )
                    )}
                  >
                    <i className="fas fa-fast-forward" aria-hidden="true"></i>
                  </div>
                  <div
                    className="box is-flex-fill has-text-centered is-electric"
                    onClick={this.toggleSelected(this.state.images.length - 1)}
                  >
                    Last
                  </div>
                </div>
              </div>
              <div className="box is-input-panel is-flex-fill is-fixed-flex-height">
                <div className="box is-scrollable">
                  <div className="box is-offset">
                    <div className="columns">
                      <div className="column is-4 is-child has-no-padding">
                        {this.button(
                          'Show AI Results',
                          null,
                          'has-margin',
                          toggleBtn
                        )}
                        {this.button(
                          'Show Pavement',
                          null,
                          'has-margin',
                          toggleBtn
                        )}
                        {this.button(
                          'Swap Pavement',
                          null,
                          'has-margin',
                          toggleBtn
                        )}
                      </div>
                      <div className="column is-4 is-child has-no-padding">
                        {this.button(
                          'Show Manual Results',
                          null,
                          'has-margin',
                          toggleBtn
                        )}
                        {this.button(
                          'Mouse Dock',
                          null,
                          'has-margin',
                          toggleBtn
                        )}
                        {this.button(
                          'Tile Result',
                          null,
                          'has-margin',
                          toggleBtn
                        )}
                      </div>
                      <div className="column is-4 is-child has-no-padding">
                        {this.button(
                          'Allow Manual',
                          null,
                          'has-margin',
                          toggleBtn
                        )}
                        {this.button('Grid', null, 'has-margin', toggleBtn)}
                        {this.button(
                          'Original Image',
                          null,
                          'has-margin',
                          toggleBtn
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="column is-8 is-subpanel">
              <div className="box is-subpanel-inverted">
                <table className="table is-scrollable">
                  <thead>
                    <tr>
                      <th></th>
                      <th>File Name</th>
                      <th>AI</th>
                      <th>Manual</th>
                      <th>Type</th>
                      <th>Pavement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...this.state.images].map(({ file }, i) => (
                      <tr
                        key={i}
                        className="image-row"
                        onClick={this.toggleSelected()}
                      >
                        <td
                          className={`image-row${i == 0 ? ' is-selected' : ''}`}
                        >
                          {i}
                        </td>
                        <th
                          className={`image-row${i == 0 ? ' is-selected' : ''}`}
                        >
                          {file.name}
                        </th>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  projectColumn() {
    return (
      <div className="box has-background-black is-panel is-flex is-stacked">
        <div className="box has-background-dark is-subpanel-compact">
          <div className="box has-background-dark is-title-panel ">
            PAVE v1.0
          </div>
          {this.mainButtons()}
        </div>
        <div className="box has-background-dark is-subpanel-flex is-flex is-stacked">
          {this.titleBox('PROJECT INFO')}
          <div className="box is-input-panel is-flex-compact">
            <div className="box">
              {this.inputBox('Project Name', 'project-diagram')}
              {this.inputBox('User', 'user')}
              {this.inputBox('Organization', 'sitemap')}
              {this.fileTransfer()}
            </div>
          </div>
          {this.titleBox('IMAGE INFO')}
          <div className="box is-input-panel is-flex-compact">
            <div className="columns">
              <div className="column is-6 is-child">
                {this.button('Road ID')}
                {this.button('Section ID')}
                {this.button('Image Names')}
                {this.button('Distance from SSP (m)')}
              </div>
              <div className="column is-6 is-child">
                {this.button('Lane Width (m)')}
                {this.dropDown(
                  'Grid Size (cm)',
                  null,
                  null,
                  [50, 150, 250],
                  (e) => {
                    const gridSize = parseInt(e.target.name);
                    this.setState({ gridSize });
                  }
                )}
                {this.button('Camera Model')}
              </div>
            </div>
          </div>
          {/* {this.titleBox('SECTION FOLDER INFO')}
          <div className="box is-input-panel is-flex-fill is-fixed-flex-height">
            <table className="table is-scrollable">
              <thead>
                <tr>
                  <th></th>
                  <th>File Name</th>
                  <th>AI</th>
                  <th>Manual</th>
                  <th>Type</th>
                  <th>Pavement</th>
                </tr>
              </thead>
              <tbody>
                {[...this.state.images].map(({ file }, i) => (
                  <tr
                    key={i}
                    className="image-row"
                    onClick={this.toggleSelected()}
                  >
                    <td className={`image-row${i == 0 ? ' is-selected' : ''}`}>
                      {i}
                    </td>
                    <th className={`image-row${i == 0 ? ' is-selected' : ''}`}>
                      {file.name}
                    </th>
                  </tr>
                ))}
              </tbody>
            </table>
          </div> */}
        </div>
      </div>
    );
  }

  toggleSelected(imageNumber = -1) {
    return (e) => {
      const imageRows = document.getElementsByClassName('image-row');
      for (let i = 0; i < imageRows.length; i++) {
        for (let child of imageRows[i].children) {
          child.className = '';
          if (child.contains(e.target) && imageNumber < 0) {
            imageNumber = i;
          }
        }
      }
      if (imageNumber >= 0) {
        this.loadFile(imageNumber)(e);
        for (let c of imageRows[imageNumber].children) {
          c.className = 'is-selected';
        }
      }
    };
  }

  titleBox(title) {
    return (
      <div className="box">
        <div className="box is-project-info-title is-flex-compact has-text-weight-bold has-overflow-hidden">
          {title}
        </div>
      </div>
    );
  }

  subTitleBox(title) {
    return (
      <div className="box is-section-eval-info is-flex-compact has-text-centered has-text-weight-semibold">
        {title}
      </div>
    );
  }

  fileTransfer() {
    return (
      <div className="box is-subpanel">
        <div className="columns">
          <div className="column is-6 is-child">
            <div className="file">
              <label className="file-label has-text-centered">
                <input
                  className="file-input"
                  type="file"
                  directory=""
                  webkitdirectory=""
                  mozdirectory=""
                  onChange={this.loadFile()}
                />
                <span className="file-cta is-subpanel has-text-weight-bold">
                  <span className="file-label is-dotted">UPLOAD FILES</span>
                </span>
              </label>
            </div>
          </div>
          <div className="column is-6 is-child">
            {this.button('DOWNLOAD RESULTS')}
          </div>
        </div>
      </div>
    );
  }

  loadFile(imageNumber = 0) {
    return (e) => {
      const image = document.getElementById('mainImage');
      let images = this.state.images;
      let rp = this.state.rp;
      for (let file of e.target.files || []) {
        if (file.name.match(/.+\.jpg$|.+\.png/gi)) {
          images.push({ file });
        } else if (file.name.match(/.rp/g)) {
          rp.push({ file });
        }
      }
      if (FileReader && _.get(images, 'length', 0) > 0) {
        var fr = new FileReader();
        fr.onload = () => {
          image.onload = () => {
            const gridScale = {
              x: image.naturalWidth / image.width,
              y: image.naturalHeight / image.height,
            };
            const pixelScale = { x: 1 / gridScale.x, y: 1 / gridScale.y };
            this.setState({ imageNumber, images, rp, pixelScale });
          };
          image.src = fr.result;
          images[imageNumber].data = image.src;
        };
        fr.readAsDataURL(images[imageNumber].file);
      }
    };
  }

  inputBox(placeholder, leftIcon) {
    return (
      <div className="control has-icons-left">
        <input
          className="input is-small"
          type="text"
          placeholder={placeholder}
        />
        <span className="icon is-small is-left">
          <i className={`fas fa-${leftIcon}`}></i>
        </span>
      </div>
    );
  }

  runAI() {
    return (e) => {
      const data = _.get(this.state.images[this.state.imageNumber], 'data');
      if (data) {
        $.ajax('http://localhost:8000/ai/run', {
          data: JSON.stringify({
            model: 'classifier',
            data,
          }),
          contentType: 'application/json',
          type: 'POST',
        }).done((data) => {
          this.setState(_.pick(data, ['labels', 'rows', 'columns', 'colors']));
        });
      }
    };
  }

  mainButtons() {
    return (
      <div className="columns">
        <div className="column is-4 is-child">
          <div className="box is-input-panel">
            {this.button('RUN AI', 'is-info', null, this.runAI())}
          </div>
        </div>
        <div className="column is-8 is-child">
          <div className="box is-input-panel">
            <div className="columns">
              <div className="column is-6 is-child">
                {this.button('OPEN RESULTS')}
              </div>
              <div className="column is-6 is-child">
                {this.button('SAVE RESULTS')}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  dropDown(name, buttonClasses, boxClasses, items, onClickFn) {
    const parts = name
      .toLowerCase()
      .split(' ')
      .map((e) => e.replace(/^\w/, (c) => c.toUpperCase()));
    const forButton = parts.join('').replace(/^\w/, (c) => c.toLowerCase());
    return (
      <div className={`box${boxClasses ? ` ${boxClasses}` : ''}`}>
        <div className="dropdown" id={forButton}>
          <div className="dropdown-trigger">
            <button
              aria-haspopup="true"
              aria-controls="dropdown-menu"
              className={`button is-dropdown is-subpanel has-text-weight-bold${
                buttonClasses ? ` ${buttonClasses}` : ''
              }`}
              onMouseMove={this.addToolTip(forButton)}
              onMouseLeave={this.removeToolTip(forButton)}
              onClick={() => {
                const dropdown = document.getElementById(forButton);
                this.toggleClass(dropdown, 'is-active');
                const menuRemovalTimeout = setTimeout(() => {
                  dropdown.classList.remove('is-active');
                }, 3000);
                this.setState({
                  menuRemovalTimeout,
                });
              }}
            >
              <div className="button-text">
                <i className="fas fa-caret-down" aria-hidden="true"></i>
                <span className="button-text half-margin">{name}</span>
              </div>
            </button>
          </div>
          <div
            className="dropdown-menu"
            id="dropdown-menu"
            role="menu"
            onMouseEnter={() => {
              clearTimeout(this.state.menuRemovalTimeout);
            }}
            onMouseLeave={() => {
              const menuRemovalTimeout = setTimeout(() => {
                const dropdown = document.getElementById(forButton);
                dropdown.classList.remove('is-active');
              }, 3000);
              this.setState({
                menuRemovalTimeout,
              });
            }}
          >
            <div className="dropdown-content">
              {items.map((itemName) => (
                <a
                  href="#"
                  className={`dropdown-item${
                    itemName == this.state.gridSize ? ' is-active' : ''
                  }`}
                  key={itemName}
                  name={itemName}
                  onClick={onClickFn}
                >
                  {itemName}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  button(name, buttonClasses, boxClasses, onClickFn) {
    const parts = name
      .toLowerCase()
      .split(' ')
      .map((e) => e.replace(/^\w/, (c) => c.toUpperCase()));
    const forButton = parts.join('').replace(/^\w/, (c) => c.toLowerCase());
    return (
      <div className={`box${boxClasses ? ` ${boxClasses}` : ''}`}>
        <button
          name={forButton}
          onClick={onClickFn}
          className={`button is-subpanel has-text-weight-bold${
            buttonClasses ? ` ${buttonClasses}` : ''
          }`}
          onMouseMove={this.addToolTip(forButton)}
          onMouseLeave={this.removeToolTip(forButton)}
        >
          <div className="button-text">{name}</div>
        </button>
      </div>
    );
  }

  addToolTip(forButton) {
    return (e) => {
      const toolTip = document.querySelector(
        `.tooltip[forButton="${forButton}"]`
      );
      const position = { x: e.clientX + 20, y: e.clientY + 20 };
      this.setState({ position });
      if (toolTip.classList.contains('hover')) {
        toolTip.classList.remove('hover');
      } else {
        toolTip.classList.add('hover');
      }
      clearTimeout(this.state.timeout);
      this.setState({
        timeout: setTimeout(() => {
          if (!toolTip.classList.contains('hover')) {
            toolTip.classList.add('hover');
          }
        }, 300),
      });
      toolTip.style.top = `${this.state.position.y}px`;
      toolTip.style.left = `${this.state.position.x}px`;
    };
  }

  removeToolTip(forButton) {
    return () => {
      const toolTip = document.querySelector(
        `.tooltip[forButton="${forButton}"]`
      );
      clearTimeout(this.state.timeout);
      toolTip.classList.remove('hover');
    };
  }

  render() {
    return (
      <div>
        <div className="tooltip" forButton="openResults">
          <span className="tooltiptext">Open Results</span>
        </div>
        <div className="tooltip" forButton="saveResults">
          <span className="tooltiptext">Save Results</span>
        </div>
        <div className="tooltip" forButton="runAi">
          <span className="tooltiptext">Run AI</span>
        </div>
        <div className="tooltip" forButton="uploadFiles">
          <span className="tooltiptext">Upload Files</span>
        </div>
        <div className="tooltip" forButton="downloadResults">
          <span className="tooltiptext">Download Results</span>
        </div>
        <div className="tooltip" forButton="roadId">
          <span className="tooltiptext">Road ID</span>
        </div>
        <div className="tooltip" forButton="sectionId">
          <span className="tooltiptext">Section ID</span>
        </div>
        <div className="tooltip" forButton="imageNames">
          <span className="tooltiptext">Image Names</span>
        </div>
        <div className="tooltip" forButton="distanceFromSsp(m)">
          <span className="tooltiptext">Distance From SSP (m)</span>
        </div>
        <div className="tooltip" forButton="laneWidth(m)">
          <span className="tooltiptext">Lane Width (m)</span>
        </div>
        <div className="tooltip" forButton="gridSize(cm)">
          <span className="tooltiptext">Grid Size (cm)</span>
        </div>
        <div className="tooltip" forButton="cameraModel">
          <span className="tooltiptext">Camera Model</span>
        </div>
        <div className="tooltip" forButton="showAiResults">
          <span className="tooltiptext">Show AI Results</span>
        </div>
        <div className="tooltip" forButton="showManualResults">
          <span className="tooltiptext">Show Manual Results</span>
        </div>
        <div className="tooltip" forButton="allowManual">
          <span className="tooltiptext">Allow Manual</span>
        </div>
        <div className="tooltip" forButton="showPavement">
          <span className="tooltiptext">Show Pavement</span>
        </div>
        <div className="tooltip" forButton="mouseDock">
          <span className="tooltiptext">Mouse Dock</span>
        </div>
        <div className="tooltip" forButton="grid">
          <span className="tooltiptext">Grid</span>
        </div>
        <div className="tooltip" forButton="swapPavement">
          <span className="tooltiptext">Swap Pavement</span>
        </div>
        <div className="tooltip" forButton="tileResult">
          <span className="tooltiptext">Tile Result</span>
        </div>
        <div className="tooltip" forButton="originalImage">
          <span className="tooltiptext">Original Image</span>
        </div>
        {this.GUI()}
      </div>
    );
  }
}

module.exports = Experimental;
