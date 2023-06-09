import { useStateContext } from "../../context/StateContext";
import { deleteNode, moveNode, removeChild } from "../useTree";

export const useFunctions = () => {
  const {
    db,
    currentTreeNote,
    setCurrentTreeNote,
    update,
    setUpdate,
    currentExpanded,
    setCurrentExpanded,
    move,
    setMove,
  } = useStateContext();

  const handleDeleteNodeWithoutItsChildren = async (
    node,
    setDeleted,
    location,
    setPaths
  ) => {
    let root = node.parent;
    deleteNode(node, location);
    while (root.parent) {
      root = root.parent;
    }
    setCurrentTreeNote((prev) => ({ ...prev, root: root }));
    await db.treeNotes
      .where("refId")
      .equals(currentTreeNote.refId)
      .modify({ root: root });
    setDeleted(false);
    let newExpanded = currentExpanded;
    if (newExpanded.hasOwnProperty(node.id)) {
      delete newExpanded[node.id];
    }
    setPaths((paths) => {
      const indexToDelete = paths.findIndex(
        (element) => element.id === node.id
      );
      if (indexToDelete !== -1) {
        paths.splice(indexToDelete, 1);
      }
      return paths;
    });
    await db.treeNotesExpanded
      .where("refId")
      .equals(currentTreeNote.refId)
      .modify((expanded) => {
        expanded.expanded = newExpanded;
      });

    setTimeout(() => {
      setDeleted(true);
      setTimeout(() => {
        setUpdate(update + 1);
      }, 100);
    }, 100);
  };

  const handleDeletePathAndExpanded = async (node, setPaths) => {
    if (node.children.length > 0) {
      for (let child of node.children) {
        handleDeletePathAndExpanded(child, setPaths);
      }
    }

    setPaths((paths) => {
      const indexToDelete = paths.findIndex(
        (element) => element.id === node.id
      );
      if (indexToDelete !== -1) {
        paths.splice(indexToDelete, 1);
      }
      return paths;
    });
    await db.treeNotesExpanded
      .where("refId")
      .equals(currentTreeNote.refId)
      .modify((expanded) => {
        delete expanded.expanded[node.id];
      });
  };

  const handleDeleteNodeWithItsChildren = async (
    node,
    setDeleted,
    location,
    setPaths
  ) => {
    handleDeletePathAndExpanded(node, setPaths);

    let root = node.parent;
    removeChild(root, node);
    while (root.parent) {
      root = root.parent;
    }
    setCurrentTreeNote((prev) => ({ ...prev, root: root }));
    await db.treeNotes
      .where("refId")
      .equals(currentTreeNote.refId)
      .modify({ root: root });
    setDeleted(false);
    let newExpanded = currentExpanded;
    if (newExpanded.hasOwnProperty(node.id)) {
      delete newExpanded[node.id];
    }
    setPaths((paths) => {
      const indexToDelete = paths.findIndex(
        (element) => element.id === node.id
      );
      if (indexToDelete !== -1) {
        paths.splice(indexToDelete, 1);
      }
      return paths;
    });
    await db.treeNotesExpanded
      .where("refId")
      .equals(currentTreeNote.refId)
      .modify((expanded) => {
        expanded.expanded = newExpanded;
      });

    setTimeout(() => {
      setDeleted(true);
      setTimeout(() => {
        setUpdate(update + 1);
      }, 100);
    }, 100);
  };

  const handleMoveNode = async (
    node,
    location,
    setIsExpanded,
    setRootExpanded
  ) => {
    if (node.parent === null) {
      moveNode(move.node, node);
      setCurrentTreeNote((prev) => ({ ...prev, root: node }));
      setMove((prev) => ({ enable: false, node: null }));
      await db.treeNotes
        .where("refId")
        .equals(currentTreeNote.refId)
        .modify({ root: root });
      // setDeleted(true);
      setTimeout(() => {
        setUpdate(update + 1);
      }, 100);
    } else {
      let root = node.parent;

      moveNode(move.node, node);
      while (root.parent) {
        root = root.parent;
      }
      setCurrentTreeNote((prev) => ({ ...prev, root: root }));
      setMove((prev) => ({
        enable: false,
        node: null,
        location: null,
        position: null,
        parentPosition: null,
      }));
      // setCurrentExpanded((prev) => ({...prev, [currentTreeNote.root.refId]: false}));
      setRootExpanded(false);

      setTimeout(async () => {
        setIsExpanded(true);
        const newPrev = {
          ...currentExpanded,
          [node?.id]: true,
        };
        await db.treeNotes
          .where("refId")
          .equals(currentTreeNote.refId)
          .modify({ root: root });
        await db.treeNotesExpanded
          .where("refId")
          .equals(currentTreeNote.refId)
          .modify((expanded) => {
            expanded.expanded = newPrev;
          });
        setTimeout(() => {
          setRootExpanded(true);
          setTimeout(() => {
            setUpdate(update + 1);
          }, 100);
        }, 100);
      }, 100);
    }
  };

  return {
    handleDeleteNodeWithoutItsChildren,
    handleDeleteNodeWithItsChildren,
    handleMoveNode,
  };
};
