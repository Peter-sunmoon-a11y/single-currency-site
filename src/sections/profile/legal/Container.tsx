type LegalProps = {
  text: {
    title?: string;
    description?: string;
    content?: string;
    open?: boolean;
  };
};

export const Container = ({ text }: LegalProps) => {
  return (
    <div className="collapse collapse-arrow bg-base-200 !rounded-lg">
      <input type="checkbox" defaultChecked={text?.open ?? true} />
      <div className="collapse-title text-sm font-bold md:text-base">
        {text?.title}
      </div>
      <div className="collapse-content text-sm">
        <div dangerouslySetInnerHTML={{ __html: text?.content ?? "" }} />
      </div>
    </div>
  );
};
