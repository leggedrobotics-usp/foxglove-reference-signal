<!-- <p align="center">
  <a href="" rel="noopener">
 <img width=200px height=200px src="https://i.imgur.com/6wj0hh6.jpg" alt="Project logo"></a>
</p> -->

<h1 align="center">foxglove-reference-signal</h1>

<div align="center">

  [![GitHub issues](https://img.shields.io/github/issues/leggedrobotics-usp/foxglove-reference-signal)](https://github.com/leggedrobotics-usp/foxglove-reference-signal/issues)
  ![GitHub pull requests](https://img.shields.io/github/issues-pr/leggedrobotics-usp/foxglove-reference-signal)
  [![GitHub forks](https://img.shields.io/github/forks/leggedrobotics-usp/foxglove-reference-signal)](https://github.com/leggedrobotics-usp/foxglove-reference-signal/network)
  [![GitHub stars](https://img.shields.io/github/stars/leggedrobotics-usp/foxglove-reference-signal)](https://github.com/leggedrobotics-usp/foxglove-reference-signal/stargazers)
  [![GitHub license](https://img.shields.io/github/license/leggedrobotics-usp/foxglove-reference-signal)](https://github.com/leggedrobotics-usp/foxglove-reference-signal/blob/main/LICENSE)

</div>

---

<p align="center"> A companion Foxglove extension for the <a href="https://github.com/leggedrobotics-usp/reference_signal_generator">reference_signal_generator</a> ROS2 package
    <br>
</p>

## 📝 Table of Contents
- [About](#about)
- [Getting Started](#getting_started)
- [Usage](#usage)
- [Feature requests](#feature_requests)
- [Contributing](#contributing)
- [Author](#author)

## 🧐 About <a name = "about"></a>
Sending a reference signal to your own control system in ROS2 has never been so simple. **foxglove-reference-signal** creates a compact [Foxglove](https://foxglove.dev/) panel with *Start* and *Stop* buttons for easily triggering the signal. With this extension, you can simultaneously send references to multiple systems or DOFs of a single system.

**foxglove-reference-signal** works as a companion extension for the [reference_signal_generator](https://github.com/leggedrobotics-usp/reference_signal_generator) ROS2 package, ensuring the best of both worlds:

- The simplicity and flexibility of Foxglove as the graphical user interface for your control system, responsible only for triggering the reference signal;
- The determinism and robustness of a ROS2 node, that is in charge of publishing the reference signal at the specified rate.

## 🏁 Getting Started <a name = "getting_started"></a>
This repo is a standard Foxglove extension, built according to the [create-foxglove-extension](https://github.com/foxglove/create-foxglove-extension) standard.

### 🛠 Prerequisites

- [foxglove_bridge](https://github.com/foxglove/ros-foxglove-bridge)
    - Required to communicate ROS2 and Foxglove. Install using apt:

    ```bash
    sudo apt install ros-$ROS_DISTRO-foxglove-bridge
    ```

    - **Run** the bridge node whenever you want to connect Foxglove and the ROS2 network

    ```bash
    ros2 run foxglove_bridge foxglove_bridge
    ```

- [reference_signal_generator](https://github.com/leggedrobotics-usp/reference_signal_generator)
    - This ROS2 package is the "back-end" for **foxglove-reference-signal**, creating the standard topics and services that are in charge of generating the signals configured in the Foxglove interface.
    - After installing this package and its prerequisites, **run** the reference signal generator node. It will populate the corresponding topic and services. Make sure to select the correct topic name in the extension panel (default is */reference_signal*)

    ```bash
    ros2 run reference_signal_generator reference_signal_generator --ros-args -p topic_name:=<your_topic_name>
    ```

### 💻 Installing

As mentioned above, this is a standard Foxglove extension. Thus, you can install it using *npm*:

```bash
git clone https://github.com/leggedrobotics-usp/foxglove-reference-signal.git
cd foxglove-reference-signal
npm run local-install
```

## 🎈 Usage <a name="usage"></a>

<!-- Each instance of **foxglove-reference-signal** binds to a user-specified topic and creates multiple services for starting and stopping several different types of reference signals. Default topic name is **/reference_signal** and user can specify through command-line as follows:

```bash
ros2 run foxglove-reference-signal foxglove-reference-signal --ros-args -p topic_name:=<your_topic_name>
```

After starting the generator node, multiple services will be created to start and stop the reference signals. Use ``ros2 topic list`` to check them out. You must see:

- ``/<your_topic_name>/chirp`` Chirp (frequency-swept cosine)
- ``/<your_topic_name>/ramp`` Ramp
- ``/<your_topic_name>/sawtooth`` Rising-ramp sawtooth wave
- ``/<your_topic_name>/sine`` Sine wave
- ``/<your_topic_name>/square`` Square wave
- ``/<your_topic_name>/step`` Step
- ``/<your_topic_name>/triangle`` Triangle wave
- ``/<your_topic_name>/stop`` Used to stop a signal created by other service before its *total_time*

See [reference_signal_srvs](https://github.com/leggedrobotics-usp/reference_signal_srvs) for more details on each type of reference signal. -->

## 🔋 Feature requests <a name="feature_requests"></a>

Want another type of reference signal? Open an *Enhancement* issue describing it.

## 🤝 Contributing <a name="contributing"></a>

- Fork the repo
  - <https://github.com/leggedrobotics-usp/foxglove-reference-signal/fork>
- Check out a new branch based and name it to what you intend to do:
  - ````bash
    git checkout -b BRANCH_NAME
    ````
- Commit your changes
  - Please provide a git message that explains what you've done;
  - Commit to the forked repository.
    ````bash
    git commit -m "A short and relevant message"
    ````
- Push to the branch
  - ````bash
    git push origin BRANCH_NAME
    ````
- Make a pull request!

## ✍️ Author <a name = "author"></a>

<a href="https://github.com/Vtn21">
 <img style="border-radius: 50%;" src="https://avatars.githubusercontent.com/u/13922299?s=460&u=2e2554bb02cc92028e5cba651b04459afd3c84fd&v=4" width="100px;" alt=""/>
 <br />
 <sub><b>Victor T. N. 🤖</b></sub></a>

Made with ❤️ by [@Vtn21](https://github.com/Vtn21)

<!-- [![Gmail Badge](https://img.shields.io/badge/-victor.noppeney@usp.br-c14438?style=flat-square&logo=Gmail&logoColor=white&link=mailto:victor.noppeney@usp.br)](mailto:victor.noppeney@usp.br) -->

<!-- -  - Idea & Initial work -->

<!-- See also the list of [contributors](https://github.com/kylelobo/The-Documentation-Compendium/contributors) who participated in this project. -->
