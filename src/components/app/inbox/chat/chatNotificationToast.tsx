import { IoNotifications } from 'react-icons/io5';

// Custom chat message toast component
export const ChatMessageToast = ({
  sender,
  message,
  // chatId,
  onClick,
}: {
  sender: string;
  message: string;
  // chatId: string;
  onClick?: () => void;
}) => (
  <div className="bg-primary flex w-[250px] cursor-pointer rounded-lg p-[1px] sm:w-[360px]">
    <div
      className="bg-bground-1/90 flex w-full cursor-pointer items-start space-x-3 rounded-lg p-3 transition"
      onClick={onClick}
    >
      <div className="flex-shrink-0">
        <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-full font-semibold text-white">
          <IoNotifications />
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {sender}
        </p>
        <p className="text-sm break-words text-gray-500 dark:text-gray-400">
          {message}
        </p>
      </div>
    </div>
  </div>
);
