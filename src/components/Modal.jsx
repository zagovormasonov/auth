import { motion, AnimatePresence } from 'framer-motion';

const Modal = ({ isOpen, titleText, title, setTitle, description, setDescription, onCancel, onConfirm }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
          }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              backgroundColor: 'black',
              padding: '20px',
              borderRadius: '8px',
              width: '300px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
              color: 'white',
            }}
          >
            <h3>{titleText}</h3>
            <input
              type="text"
              placeholder="Название"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: '100%', marginBottom: '10px', padding: '5px' }}
            />
            <textarea
              placeholder="Описание"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ width: '100%', marginBottom: '10px', padding: '5px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={onConfirm}>Сохранить</button>
              <button onClick={onCancel}>Отмена</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;