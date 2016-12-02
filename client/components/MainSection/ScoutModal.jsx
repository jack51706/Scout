import React, { Component, PropTypes as T } from 'react'
import { Modal, message } from 'antd'
import fetch from 'isomorphic-fetch'
import ScoutForm from './ScoutForm'
import { origin } from '../../config'

class ScoutModal extends Component {
  constructor() {
    super()
    this.state = {
      newId: 0,
      scout: {},
    }
    this.handleOk = this.handleOk.bind(this)
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.activeId !== this.props.activeId) {
      if (nextProps.activeId) {
        fetch(`${origin}/scout/${nextProps.activeId}`)
        .then(res => res.json())
        .then((scout) => {
          this.setState({ scout })
        })
      } else {
        this.setState({ scout: {} })
      }
    }
  }
  handleOk() {
    const data = this.form.getFieldsValue()
    if (this.props.activeId) {
      fetch(`${origin}/scout/${this.props.activeId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
      .then(res => res.json())
      .then((json) => {
        this.props.setScouts(
          this.props.scouts.map(scout => (
            scout.id === this.props.activeId ? json : scout
          )),
        )
        this.props.closeModal()
        message.success('修改成功')
      })
    } else {
      this.form.validateFieldsAndScroll((err) => {
        if (!err) {
          fetch(`${origin}/scout`, {
            method: 'POST',
            body: JSON.stringify(data),
          })
          .then(res => res.json())
          .then((json) => {
            this.props.closeModal()
            this.props.setScouts([json].concat(this.props.scouts))
            this.setState({ newId: this.state.newId + 1 })
            message.success('添加成功')
          })
        }
      })
    }
  }

  render() {
    const { scout } = this.state
    return (
      <Modal
        maskClosable={false}
        title={this.props.activeId ? `编辑${scout.name}` : '添加监控'}
        width={720}
        visible={this.props.isOpen}
        onOk={this.handleOk}
        onCancel={this.props.closeModal}
      >
        <ScoutForm
          key={this.props.activeId || this.state.newId}
          ref={(c) => { this.form = c }}
          scout={scout}
          allTags={this.props.allTags}
          allRecipients={this.props.allRecipients}
        />
      </Modal>
    )
  }
}

ScoutModal.propTypes = {
  scouts: T.arrayOf(T.shape({
    id: T.string,
  })),
  setScouts: T.func,
  activeId: T.string,
  isOpen: T.bool,
  allTags: T.arrayOf(T.string),
  allRecipients: T.arrayOf(T.string),
  closeModal: T.func,
}

export default ScoutModal
