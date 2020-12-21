/**
 * MAIN CLASS
 */
class ImagePanel extends React.Component {
  constructor(props) {
    super(props);
    this.parent = props.parent;
  }

  subTitleBox(title) {
    return (
      <div className="box is-section-eval-info is-flex-compact has-text-centered has-text-weight-semibold">
        {title}
      </div>
    );
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

  render() {
    return (
      <div className="box has-background-black is-image-panel">
        <div className="columns has-subpanels">
          <div className="column is-12 is-child has-padding">
            <div className="box has-background-dark is-subpanel is-flex is-stacked">
              {this.titleBox('IMAGE NAME')}
              <div className="box is-input-panel is-flex-fill">
                <div className="box is-fullsize">
                  <img id="mainImage" />
                  <img
                    id="zoomInOverlay"
                    onMouseMove={this.parent.zoomIn()}
                    onMouseLeave={this.parent.zoomIn(false)}
                    onMouseEnter={() => {
                      this.parent.setState({ mouseOverImage: true });
                    }}
                  />
                  <div
                    id="grid"
                    style={{
                      '--grid-size': `${this.parent.state.gridSize}px`,
                      '--pixel-scale-x': `${this.parent.state.pixelScale.x}`,
                      '--pixel-scale-y': `${this.parent.state.pixelScale.y}`,
                    }}
                  ></div>
                  <div
                    id="grid"
                    className="is-scripted"
                    style={{
                      '--grid-columns': this.parent.state.columns,
                      '--grid-rows': this.parent.state.rows,
                      '--grid-size': `${this.parent.state.gridSize}px`,
                      '--pixel-scale-x': `${this.parent.state.pixelScale.x}`,
                      '--pixel-scale-y': `${this.parent.state.pixelScale.y}`,
                    }}
                  >
                    {this.parent.state.labels.map((label, i) => {
                      console.log(this.parent.state.colors[label]);
                      return (
                        <div
                          key={`label-${i}`}
                          style={{
                            backgroundColor: this.parent.state.colors[label],
                            opacity:
                              this.parent.state.colors[label] === 'transparent'
                                ? 0
                                : 0.5,
                          }}
                        ></div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

ImagePanel.propTypes = {
  parent: PropTypes.object,
};

module.exports = ImagePanel;
